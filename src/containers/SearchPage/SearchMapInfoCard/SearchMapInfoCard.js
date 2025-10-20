import classNames from 'classnames';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import ImageSlider from '../../../components/ImageSlider/ImageSlider';
import { IconCollection } from '../../../components';
import {
  checkPriceParams,
  formatPriceInMillions,
} from '../../../components/ListingCard/ListingCard';
import { Icon } from '../../../containers/PageBuilder/SectionBuilder/SectionArticle/PropertyCards';
import { displayPrice } from '../../../util/configHelpers';
import { ensureListing, ensureUser } from '../../../util/data';
import { capitaliseFirstLetter, sortTags } from '../../../util/helper';
import { useIntl } from '../../../util/reactIntl';
import { richText } from '../../../util/richText';
import { propTypes } from '../../../util/types';
import css from './SearchMapInfoCard.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 10;

const PriceMaybe = props => {
  const { intl, price, publicData, config, isRentals, currencyConversion } = props;
  const { listingType } = publicData || {};
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  if (!showPrice && price) {
    return null;
  }

  const needPriceConversion = currencyConversion?.selectedCurrency === 'USD';
  const convertedPrice = needPriceConversion ? price * currencyConversion?.conversionRate.USD : price;
  
  const formattedPrice = convertedPrice ? formatPriceInMillions(convertedPrice) : null;
  const priceParams = checkPriceParams();

  let suffix;
  if (priceParams?.weekprice || priceParams?.monthprice || priceParams?.yearprice) {
    if (priceParams.weekprice) {
      suffix = '/ ' + intl.formatMessage({ id: 'ListingCard.weekly' });
    } else if (priceParams.monthprice) {
      suffix = '/ ' + intl.formatMessage({ id: 'ListingCard.monthly' });
    } else if (priceParams.yearprice) {
      suffix = '/ ' + intl.formatMessage({ id: 'ListingCard.yearly' });
    }
  } else {
    if (publicData?.monthprice) {
      suffix = '/ ' + intl.formatMessage({ id: 'ListingCard.monthly' });
    } else if (publicData?.weekprice) {
      suffix = '/ ' + intl.formatMessage({ id: 'ListingCard.weekly' });
    } else if (publicData?.yearprice) {
      suffix = '/ ' + intl.formatMessage({ id: 'ListingCard.yearly' });
    }
  }

  return (
    <div className={css.price}>
      <span className={css.priceValue}>
        {formattedPrice} {currencyConversion?.selectedCurrency}
        {isRentals && <span>{suffix}</span>}
      </span>
    </div>
  );
};

// ListingCard is the listing info without overlayview or carousel controls
const ListingCard = props => {
  const history = useHistory();
  const { className, clickHandler, intl, isInCarousel, listing, urlToListing, config, currencyConversion } = props;
  const { title, price: p, publicData } = listing.attributes;
  const author = ensureUser(listing.author);

  // listing card anchor needs sometimes inherited border radius.
  const classes = classNames(
    css.anchor,
    css.borderRadiusInheritTop,
    { [css.borderRadiusInheritBottom]: !isInCarousel },
    className
  );

  const {
    pricee,
    location,
    propertytype,
    bedrooms,
    bathrooms,
    Freehold,
    categoryLevel1,
    landzone,
    landsize,
    weekprice,
    monthprice,
    yearprice,
  } = publicData;
  const isLand = categoryLevel1 === 'landforsale';
  const isRentals = categoryLevel1 === 'rentalvillas';

  const tags = sortTags(pricee);

  const imagesUrls = listing.images.map(img => img.attributes.variants['landscape-crop2x']?.url);

  const handleCardInteraction = e => {
    // Prevent map from moving when interacting with card content
    e.stopPropagation();
  };

  const handleTouchStart = e => {
    e.stopPropagation();
  };

  const handleTouchMove = e => {
    e.stopPropagation();
  };

  const handleTouchEnd = e => {
    e.stopPropagation();
  };

  const handleWheel = e => {
    e.stopPropagation();
  };

  let price;

  if (isRentals) {
    const priceParams = checkPriceParams();

    if (priceParams?.weekprice) {
      price = weekprice;
    } else if (priceParams?.monthprice) {
      price = monthprice;
    } else if (priceParams?.yearprice) {
      price = yearprice;
    } else if (pricee.includes('monthly')) {
      price = monthprice;
    } else if (pricee.includes('weekly')) {
      price = weekprice;
    } else if (pricee.includes('yearly')) {
      price = yearprice;
    }
  } else {
    price = p.amount / 100;
  }

  return (
    <div className={classes}>
      <div
        className={classNames(css.card, css.borderRadiusInheritTop, {
          [css.borderRadiusInheritBottom]: !isInCarousel,
        })}
      >
        <div
          className={css.imageWrapper}
          onMouseDown={handleCardInteraction}
          onMouseMove={handleCardInteraction}
          onMouseUp={handleCardInteraction}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <ImageSlider loop={imagesUrls.length > 1} title={title} className={css.slider}>
            {imagesUrls.map((img, imgIdx) => (
              <a
                alt={title}
                href={urlToListing}
                onClick={e => {
                  e.preventDefault();
                  // Use clickHandler from props to call internal router
                  clickHandler(listing);
                }}
                key={imgIdx}
              >
                <img src={img} alt={title} className={css.image + ' ' + css.imageFade} />
              </a>
            ))}
          </ImageSlider>
        </div>

        <a
          className={css.info}
          alt={title}
          href={urlToListing}
          onClick={e => {
            e.preventDefault();
            // Use clickHandler from props to call internal router
            clickHandler(listing);
          }}
          onMouseDown={handleCardInteraction}
          onMouseMove={handleCardInteraction}
          onMouseUp={handleCardInteraction}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <div className={css.tags}>
            {tags?.map(tag => (
              <span className={css.tag} key={tag}>
                {intl.formatMessage({ id: tag })}
              </span>
            ))}
            {!!Freehold && <span className={css.tag}>{capitaliseFirstLetter(Freehold)}</span>}
            <span className={css.listedBy} onClick={() => history.push(`/u/${author.id.uuid}`)}>
              {intl.formatMessage({ id: 'ListingPage.aboutProviderTitle' })}:{' '}
              <span className={css.listedByName}>{author.attributes.profile.displayName}</span>
            </span>
          </div>

          <div className={css.mainInfo}>
            <div className={css.title}>
              {richText(title, {
                longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
                longWordClass: css.longWord,
              })}
            </div>
            <div className={css.location}>
              {!isLand && (
                <>
                  <span className={css.typeIcon}>
                    <IconCollection name="typeIcon" />
                  </span>
                  <span className={css.type}>{capitaliseFirstLetter(propertytype)}</span>
                </>
              )}

              <span className={css.locationWrapper}>
                <span className={css.locationIcon}>
                  <IconCollection name="locationIcon" />
                </span>
                {location?.address}
              </span>
            </div>
            <div className={css.bottomContent}>
              <div className={css.icons}>
                {!!bedrooms && (
                  <span className={css.iconItem}>
                    <Icon type="bed" /> {bedrooms} bedroom{bedrooms > 1 ? 's' : ''}
                  </span>
                )}
                {!!bathrooms && (
                  <span className={css.iconItem}>
                    <Icon type="bath" /> {bathrooms} bathroom{bathrooms > 1 ? 's' : ''}
                  </span>
                )}

                {!!landsize && isLand && (
                  <span className={css.iconItem}>
                    <Icon type="land" /> {landsize} m2
                  </span>
                )}
                {!!landzone && isLand && (
                  <span className={css.iconItem}>
                    <Icon type="zone" /> {landzone} Zone
                  </span>
                )}
              </div>
              <PriceMaybe
                price={price}
                publicData={publicData}
                config={config}
                intl={intl}
                isRentals={isRentals}
                currencyConversion={currencyConversion}
              />
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

/**
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that extends the default class for the root element
 * @param {Array<propTypes.listing>} props.listings - The listings
 * @param {Function} props.onListingInfoCardClicked - The function to handle the listing info card click
 * @param {Function} props.createURLToListing - The function to create the URL to the listing
 * @param {Function} [props.onClose] - The function to handle closing the info card
 * @param {Object} props.config - The configuration
 * @param {string} [props.caretPosition] - Position of the caret (top-left, top-right, bottom-left, bottom-right)
 * @returns {JSX.Element}
 */
const SearchMapInfoCard = props => {
  const [currentListingIndex, setCurrentListingIndex] = useState(0);
  const intl = useIntl();
  const {
    className,
    rootClassName,
    listings,
    createURLToListing,
    onListingInfoCardClicked,
    onClose,
    config,
    caretPosition,
    currencyConversion,
  } = props;
  const currentListing = ensureListing(listings[currentListingIndex]);
  const hasCarousel = listings.length > 1;

  const classes = classNames(rootClassName || css.root, className);

  let positionCaretClass = null;
  if (caretPosition === 'bottom-left') {
    positionCaretClass = css.caretBottomLeft;
  } else if (caretPosition === 'bottom-right') {
    positionCaretClass = css.caretBottomRight;
  } else if (caretPosition === 'top-left') {
    positionCaretClass = css.caretTopLeft;
  } else if (caretPosition === 'top-right') {
    positionCaretClass = css.caretTopRight;
  }

  const caretClass = classNames(css.caret, positionCaretClass, {
    [css.caretWithCarousel]: hasCarousel,
  });

  const handleCloseClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  const handleCardInteraction = e => {
    // Prevent map from moving when interacting with card content
    e.stopPropagation();
  };

  const handleTouchStart = e => {
    e.stopPropagation();
  };

  const handleTouchMove = e => {
    e.stopPropagation();
  };

  const handleTouchEnd = e => {
    e.stopPropagation();
  };

  const handleWheel = e => {
    e.stopPropagation();
  };

  return (
    <div
      className={classes}
      onMouseDown={handleCardInteraction}
      onMouseMove={handleCardInteraction}
      onMouseUp={handleCardInteraction}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <span className={css.closeIcon} onClick={handleCloseClick}>
        <svg
          width="12"
          height="11"
          viewBox="0 0 12 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.5 10L10.5 1M1.5 1L10.5 10"
            stroke="#231F20"
            stroke-width="1.5"
            stroke-linecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className={css.caretShadow} />
      <ListingCard
        clickHandler={onListingInfoCardClicked}
        urlToListing={createURLToListing(currentListing)}
        listing={currentListing}
        intl={intl}
        isInCarousel={hasCarousel}
        config={config}
        currencyConversion={currencyConversion}
      />
      {hasCarousel ? (
        <div
          className={classNames(css.paginationInfo, css.borderRadiusInheritBottom)}
          onMouseDown={handleCardInteraction}
          onMouseMove={handleCardInteraction}
          onMouseUp={handleCardInteraction}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <button
            className={css.paginationPrev}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentListingIndex(
                prevListingIndex => (prevListingIndex + listings.length - 1) % listings.length
              );
            }}
          />
          <div className={css.paginationPage}>
            {`${currentListingIndex + 1}/${listings.length}`}
          </div>
          <button
            className={css.paginationNext}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentListingIndex(
                prevListingIndex => (prevListingIndex + listings.length + 1) % listings.length
              );
            }}
          />
        </div>
      ) : null}
      <div className={caretClass} />
    </div>
  );
};

export default SearchMapInfoCard;
