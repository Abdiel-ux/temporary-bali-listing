import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';

import NoImageIcon from './NoImageIcon';
import css from './ResponsiveImage.module.css';

const ResponsiveImage = props => {
  const {
    className,
    rootClassName,
    alt,
    noImageMessage,
    image,
    variants,
    dimensions,
    fromSectionHero,
    ...rest
  } = props;
  const classes = classNames(rootClassName || css.root, className);

  if (image == null || variants.length === 0) {
    const noImageClasses = classNames(rootClassName || css.root, css.noImageContainer, className);
    const noImageMessageText = noImageMessage || <FormattedMessage id="ResponsiveImage.noImage" />;
    return (
      <div className={noImageClasses}>
        <div className={css.noImageWrapper}>
          <NoImageIcon className={css.noImageIcon} />
          <div className={css.noImageText}>{noImageMessageText}</div>
        </div>
      </div>
    );
  }

  const imageVariants = image.attributes?.variants;
  
  if (!imageVariants) {
    console.warn('Image variants not found:', image);
    if (image.attributes?.url) {
      return (
        <img 
          alt={alt}
          src={image.attributes.url}
          className={classes}
          loading="lazy"
          decoding="async"
          fetchpriority={fromSectionHero ? "high" : null}
          {...rest}
        />
      );
    }
    const noImageClasses = classNames(rootClassName || css.root, css.noImageContainer, className);
    const noImageMessageText = noImageMessage || <FormattedMessage id="ResponsiveImage.noImage" />;
    return (
      <div className={noImageClasses}>
        <div className={css.noImageWrapper}>
          <NoImageIcon className={css.noImageIcon} />
          <div className={css.noImageText}>{noImageMessageText}</div>
        </div>
      </div>
    );
  }

  const srcSet = variants
    .map(variantName => {
      const variant = imageVariants[variantName];
      if (!variant) {
        return null;
      }
      return `${variant.url} ${variant.width}w`;
    })
    .filter(v => v != null)
    .join(', ');

  const firstVariant = variants.find(variantName => imageVariants[variantName]);
  const src = firstVariant ? imageVariants[firstVariant].url : image.attributes?.url;

  if (!src) {
    console.warn('No valid image source found:', { image, variants, imageVariants });
    const noImageClasses = classNames(rootClassName || css.root, css.noImageContainer, className);
    const noImageMessageText = noImageMessage || <FormattedMessage id="ResponsiveImage.noImage" />;
    return (
      <div className={noImageClasses}>
        <div className={css.noImageWrapper}>
          <NoImageIcon className={css.noImageIcon} />
          <div className={css.noImageText}>{noImageMessageText}</div>
        </div>
      </div>
    );
  }

  const imgProps = {
    className: classes,
    src, 
    srcSet: srcSet || undefined, 
    ...rest,
  };

  return (
    <img 
      alt={alt} 
      loading="lazy"
      decoding="async"
      fetchpriority={fromSectionHero ? "high" : null}
      {...imgProps} 
    />
  );
};

export default ResponsiveImage;