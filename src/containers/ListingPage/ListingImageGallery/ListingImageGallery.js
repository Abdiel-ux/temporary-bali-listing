import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import ReactImageGallery from 'react-image-gallery';

import { propTypes } from '../../../util/types';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import {
  AspectRatioWrapper,
  Button,
  IconClose,
  IconArrowHead,
  ResponsiveImage,
} from '../../../components';

// Copied directly from
// `node_modules/react-image-gallery/styles/css/image-gallery.css`. The
// copied file is left unedited, and all the overrides are defined in
// the component CSS file below.
import './image-gallery.css';

import css from './ListingImageGallery.module.css';

const IMAGE_GALLERY_OPTIONS = {
  showPlayButton: false,
  disableThumbnailScroll: true,
};
const MAX_LANDSCAPE_ASPECT_RATIO = 2; // 2:1
const MAX_PORTRAIT_ASPECT_RATIO = 4 / 3;

const getFirstImageAspectRatio = (firstImage, scaledVariant) => {
  if (!firstImage) {
    return { aspectWidth: 1, aspectHeight: 1 };
  }

  const v = firstImage?.attributes?.variants?.[scaledVariant];
  const w = v?.width;
  const h = v?.height;
  const hasDimensions = !!w && !!h;
  const aspectRatio = w / h;

  // We keep the fractions separated as these are given to AspectRatioWrapper
  // which expects separate width and height
  return hasDimensions && aspectRatio >= MAX_LANDSCAPE_ASPECT_RATIO
    ? { aspectWidth: 2, aspectHeight: 1 }
    : hasDimensions && aspectRatio <= MAX_PORTRAIT_ASPECT_RATIO
    ? { aspectWidth: 4, aspectHeight: 3 }
    : hasDimensions
    ? { aspectWidth: w, aspectHeight: h }
    : { aspectWidth: 1, aspectHeight: 1 };
};

/**
 * The ListingImageGallery component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {Array<propTypes.image>} props.images - The images
 * @param {Array<string>} props.imageVariants - The image variants
 * @param {Array<string>} props.thumbnailVariants - The thumbnail variants
 * @returns {JSX.Element} listing image gallery component
 */
const ListingImageGallery = props => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const galleryRef = useRef(null);
  const intl = useIntl();
  const { rootClassName, className, images, imageVariants, thumbnailVariants } = props;
  const thumbVariants = thumbnailVariants || imageVariants;
  // imageVariants are scaled variants.
  const { aspectWidth, aspectHeight } = getFirstImageAspectRatio(images?.[0], imageVariants[0]);

  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const items = images.map((img, i) => {
    return {
      // We will only use the image resource, but react-image-gallery
      // requires the `original` key from each item.
      original: '',
      alt: intl.formatMessage(
        { id: 'ListingImageGallery.imageAltText' },
        { index: i + 1, count: images.length }
      ),
      thumbAlt: intl.formatMessage(
        { id: 'ListingImageGallery.imageThumbnailAltText' },
        { index: i + 1, count: images.length }
      ),
      thumbnail: img.attributes?.variants?.[thumbVariants[0]],
      image: img,
    };
  });

  // Handle mobile thumbnail visibility
  React.useEffect(() => {
    // Add a small delay to ensure DOM elements are available
    const timeoutId = setTimeout(() => {
      if (isMobile && !isFullscreen && items.length > 3) {
        const thumbnails = document.querySelectorAll('.image-gallery-thumbnail');

        if (thumbnails.length > 0) {
          thumbnails.forEach((thumb, index) => {
            let shouldShow = false;

            // For first slide, show first, second, third
            if (currentIndex === 0) {
              shouldShow = index <= 2;
            }
            // For last slide, show third-to-last, second-to-last, last
            else if (currentIndex === items.length - 1) {
              shouldShow = index >= items.length - 3;
            }
            // For middle slides, show previous, current, next
            else {
              shouldShow =
                index === currentIndex - 1 || // previous
                index === currentIndex ||     // current
                index === currentIndex + 1;   // next
            }

            if (shouldShow) {
              thumb.style.display = 'inline-block';
            } else {
              thumb.style.display = 'none';
            }
          });
        }
      } else if (isMobile && !isFullscreen && items.length <= 3) {
        // Show all thumbnails if 3 or fewer
        const thumbnails = document.querySelectorAll('.image-gallery-thumbnail');
        if (thumbnails.length > 0) {
          thumbnails.forEach(thumb => {
            thumb.style.display = 'inline-block';
          });
        }
      } else if (!isMobile || isFullscreen) {
        // Show all thumbnails in desktop or fullscreen
        const thumbnails = document.querySelectorAll('.image-gallery-thumbnail');
        if (thumbnails.length > 0) {
          thumbnails.forEach(thumb => {
            thumb.style.display = 'inline-block';
          });
        }
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timeoutId);
  }, [currentIndex, isMobile, isFullscreen, items.length]);

  // Handler untuk klik gambar di mobile
  const handleImageClick = () => {
    // Hanya aktifkan fullscreen saat klik di mobile dan belum fullscreen
    if (isMobile && !isFullscreen && galleryRef.current) {
      galleryRef.current.fullScreen();
    }
  };

  const imageSizesMaybe = isFullscreen
    ? {}
    : { sizes: `(max-width: 1024px) 100vw, (max-width: 1200px) calc(100vw - 192px), 708px` };

  const renderItem = item => {
    return (
      <AspectRatioWrapper
        width={aspectWidth || 1}
        height={aspectHeight || 1}
        className={isFullscreen ? css.itemWrapperFullscreen : css.itemWrapper}
        onClick={handleImageClick}
        style={isMobile && !isFullscreen ? { cursor: 'pointer' } : {}}
      >
        <div className={css.itemCentering}>
          <ResponsiveImage
            rootClassName={css.item}
            image={item.image}
            alt={item.alt}
            variants={imageVariants}
            {...imageSizesMaybe}
          />
        </div>
      </AspectRatioWrapper>
    );
  };

  const renderThumbInner = item => {
    return (
      <div>
        <ResponsiveImage
          rootClassName={css.thumb}
          image={item.image}
          alt={item.thumbAlt}
          variants={thumbVariants}
          sizes="88px"
        />
      </div>
    );
  };

  const onScreenChange = isFull => {
    setIsFullscreen(isFull);
  };

  const onSlide = index => {
    setCurrentIndex(index);
  };

  const renderLeftNav = (onClick, disabled) => {
    return (
      <button className={css.navLeft} disabled={disabled} onClick={onClick}>
        <div className={css.navArrowWrapper}>
          <IconArrowHead direction="left" size="big" />
        </div>
      </button>
    );
  };

  const renderRightNav = (onClick, disabled) => {
    return (
      <button className={css.navRight} disabled={disabled} onClick={onClick}>
        <div className={css.navArrowWrapper}>
          <IconArrowHead direction="right" size="big" />
        </div>
      </button>
    );
  };

  const renderFullscreenButton = (onClick, isFullscreen) => {
    return isFullscreen ? (
      <Button
        onClick={onClick}
        rootClassName={css.close}
        title={intl.formatMessage({ id: 'ListingImageGallery.closeModalTitle' })}
      >
        <span className={css.closeText}>
          <FormattedMessage id="ListingImageGallery.closeModal" />
        </span>
        <IconClose rootClassName={css.closeIcon} />
      </Button>
    ) : (
      <div
        className={css.openFullscreenWrapper}
        style={{
          backgroundImage: images?.[0]?.attributes?.variants?.[thumbVariants[0]]?.url
            ? `url(${images[0].attributes.variants[thumbVariants[0]].url})`
            : 'none',
        }}
      >
        <button className={css.openFullscreen} onClick={onClick}>
          {/* <FormattedMessage
            id="ListingImageGallery.viewImagesButton"
            values={{ count: images.length }}
          /> */}
          All Photos
        </button>
      </div>
    );
  };

  if (items.length === 0) {
    return <ResponsiveImage className={css.noImage} image={null} variants={[]} alt="" />;
  }

  const classes = classNames(rootClassName || css.root, className);

  return (
    <ReactImageGallery
      ref={galleryRef}
      additionalClass={classes}
      items={items}
      renderItem={renderItem}
      renderThumbInner={renderThumbInner}
      onScreenChange={onScreenChange}
      renderLeftNav={renderLeftNav}
      renderRightNav={renderRightNav}
      renderFullscreenButton={renderFullscreenButton}
      {...IMAGE_GALLERY_OPTIONS}
      onSlide={onSlide}
    />
  );
};

export default ListingImageGallery;
