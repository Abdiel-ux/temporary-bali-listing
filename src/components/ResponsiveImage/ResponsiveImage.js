import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';

import NoImageIcon from './NoImageIcon';
import css from './ResponsiveImage.module.css';
import heroImage from '../../assets/balilisting-hero.webp';
import heroImage1024 from '../../assets/balilisting-hero-1024.webp';

/**
 * Responsive image
 * Usage without sizes:
 *   <ResponsiveImage
 *     alt="ListingX"
 *     image={imageDataFromSDK}
 *     variants={['landscape-crop', 'landscape-crop2x']}
 *   />
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string} props.alt alt attribute for the img element
 * @param {Object?} props.image API entity (image or imageAsset)
 * @param {Array<string>} props.variants
 * @param {string?} props.sizes sizes attribute for the img element (to be used with srcset)
 * @param {string?} props.noImageMessage message to be shown, when no image was given
 * @returns {JSX.Element} responsive image
 */
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

  // Manual LCP optimization for landing page
  if (fromSectionHero) {
    return (
      <img
        alt={alt}
        {...imgProps}
        src={heroImage}
        srcSet={`${heroImage1024} 800w, ${heroImage} 1920w`}
        sizes="100vw"
        fetchpriority="high"
      />
    );
  }

  return <img alt={alt} {...imgProps} />;
};

export default ResponsiveImage;