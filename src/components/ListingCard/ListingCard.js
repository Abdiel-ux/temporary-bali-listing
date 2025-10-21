import classNames from 'classnames';
import React from 'react';

import { useConfiguration } from '../../context/configurationContext';

import NamedLink from '../../components/NamedLink/NamedLink';
import IconCollection from '../../components/IconCollection/IconCollection';
import { displayPrice } from '../../util/configHelpers';
import { ensureListing, ensureUser } from '../../util/data';
import { useIntl } from '../../util/reactIntl';
import { richText } from '../../util/richText';
import { createSlug } from '../../util/urlHelpers';
import { checkIsProvider } from '../../util/userHelpers';

import { Icon } from '../../containers/PageBuilder/SectionBuilder/SectionArticle/PropertyCards';
import { capitaliseFirstLetter, sortTags } from '../../util/helper';
import css from './ListingCard.module.css';
import { handleToggleFavorites, isFavorite as isFavoriteUtil } from '../../util/userFavorites';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ImageSlider from '../ImageSlider/ImageSlider';

const MIN_LENGTH_FOR_LONG_WORDS = 10;

// Helper function to get best available image variant
const getBestImageUrl = img => {
  if (!img || !img.attributes) return null;

  const variants = img.attributes.variants || {};

  // Priority order for variants
  const variantPriority = ['listing-card', 'scaled-small'];

  // Try each variant in order
  for (const variantName of variantPriority) {
    if (variants[variantName]?.url) {
      return variants[variantName].url;
    }
  }

  // Fallback to direct URL
  return img.attributes.url || null;
};

// Format price in millions if appropriate
export const formatPriceInMillions = actualPrice => {
  if (!actualPrice) return null;

  // Check if the price is in millions (1,000,000 or more)
  if (actualPrice >= 1000000) {
    const millions = actualPrice / 1000000;
    // If it's a whole number, show without decimal
    if (millions % 1 === 0) {
      return `${millions}M`;
    } else {
      // Show with one decimal place for partial millions
      return `${millions.toFixed(1)}M`;
    }
  }

  // For smaller amounts, show the actual price
  return `${actualPrice.toLocaleString()}`;
};

// Helper function to format price with currency, handling millions appropriately
export const formatPriceWithCurrency = (actualPrice, currency = 'IDR') => {
  if (actualPrice) {
    // Check if the price is greater than 1 million
    if (actualPrice > 1_000_000) {
      const millions = Number(actualPrice) / 1_000_000;
      const formattedMillions = millions % 1 === 0 ? Math.trunc(millions) : millions.toFixed(1);
      return `${currency} ${formattedMillions}M`;
    } else {
      // For smaller amounts, show the actual price with currency
      return `${currency} ${Number(actualPrice).toLocaleString()}`;
    }
  }
  return null;
};

export const checkPriceParams = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const weekprice = urlParams.get('pub_weekprice') || null;
    const monthprice = urlParams.get('pub_monthprice') || null;
    const yearprice = urlParams.get('pub_yearprice') || null;

    return { weekprice, monthprice, yearprice };
  }
};

const PriceMaybe = props => {
  const { price, publicData, config, isRentals, intl } = props;
  const USDConversionRate = useSelector(state => state.currency.conversionRate?.USD);
  const selectedCurrency = useSelector(state => state.currency.selectedCurrency);
  const needPriceConversion = selectedCurrency === 'USD';

  const { listingType } = publicData || {};
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);

  if (!showPrice) {
    return null;
  }

  let priceToDisplay = isRentals ? null : price;
  let suffix = null;

  if (isRentals) {
    const priceParams = checkPriceParams();
    const periodPriority = ['yearprice', 'monthprice', 'weekprice'];
    let activePeriodKey = '';

    // Prioritize URL params for determining which period to show
    for (const p of periodPriority) {
      if (priceParams && priceParams[p]) {
        activePeriodKey = p;
        break;
      }
    }

    // Fallback to publicData if no relevant URL param
    if (!activePeriodKey) {
      for (const p of periodPriority) {
        if (publicData && publicData[p]) {
          activePeriodKey = p;
          break;
        }
      }
    }

    if (activePeriodKey) {
      priceToDisplay = publicData[activePeriodKey];
      suffix = `/ ${intl.formatMessage({
        id: 'ListingCard.' + activePeriodKey.replace('price', 'ly'),
      })}`;
    }
  }

  // Apply conversion if needed. This now correctly handles non-rentals.
  const finalPrice =
    needPriceConversion && priceToDisplay ? priceToDisplay * USDConversionRate : priceToDisplay;

  const formatDisplayPrice = (priceValue, currency) => {
    if (priceValue === null || priceValue === undefined) return null;

    if (currency === 'USD') {
      return `$${Math.round(priceValue).toLocaleString('en-US')}`;
    }

    // IDR logic
    if (priceValue >= 1000000) {
      const millions = priceValue / 1000000;
      const value = millions % 1 === 0 ? millions : millions.toFixed(1);
      return `${value}M IDR`;
    }
    return `${priceValue.toLocaleString()} IDR`;
  };

  const formattedPrice = formatDisplayPrice(finalPrice, selectedCurrency);

  if (!formattedPrice) {
    return null;
  }

  return (
    <div className={css.price}>
      <span className={css.priceValue}>
        {formattedPrice}
        {isRentals && suffix && <span>{suffix}</span>}
      </span>
    </div>
  );
};

export const ListingCard = props => {
  const config = useConfiguration();
  const intl = props.intl || useIntl();
  const {
    className,
    rootClassName,
    listing,
    renderSizes,
    setActiveListing,
    showAuthorInfo = true,
    currentUser,
    onUpdateFavorites,
    showWishlistButton = true,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);

  const id = currentListing.id.uuid;
  const { title = '', price: p, publicData } = currentListing.attributes;
  const slug = createSlug(title);
  const author = ensureUser(listing.author);
  const {
    pricee,
    location,
    propertytype,
    bedrooms,
    bathrooms,
    kitchen,
    pool,
    categoryLevel1,
    landzone,
    landsize,
    Freehold,
  } = publicData;
  const tags = sortTags(pricee);
  const isLand = categoryLevel1 === 'landforsale';
  const isRentals = categoryLevel1 === 'rentalvillas';
  const history = useHistory();
  const routeLocation = useLocation();
  const routes = useRouteConfiguration();

  const price = isRentals ? null : p.amount / 100;

  const setActivePropsMaybe = setActiveListing
    ? {
        onMouseEnter: () => setActiveListing(currentListing.id),
        onMouseLeave: () => setActiveListing(null),
      }
    : null;

  // ✅ FIXED: Process images with proper fallback chain
  const imagesUrls = currentListing.images?.map(img => getBestImageUrl(img)).filter(Boolean) || [];

  const isFavorite = isFavoriteUtil(currentUser, id);

  const onToggleFavorites = e => {
    e.preventDefault();
    e.stopPropagation();

    handleToggleFavorites({
      location: routeLocation,
      history,
      routes,
      currentUser,
      params: { id },
      onUpdateFavorites,
    })(isFavorite);
  };

  return (
    <NamedLink name="ListingPage" params={{ id, slug }} className={classes}>
      {showWishlistButton && !checkIsProvider(currentUser) && (
        <button
          className={classNames(css.wishlistButton, isFavorite ? css.active : '')}
          onClick={onToggleFavorites}
        >
          <IconCollection name="icon-waislist" />
        </button>
      )}

      <div className={css.imageWrapper}>
        <ImageSlider loop={imagesUrls.length > 1} images={imagesUrls} title={title} />
      </div>
      <div className={css.info}>
        <div className={css.tags}>
          {tags?.map(tag => (
            <span className={css.tag} key={tag}>
              {intl.formatMessage({ id: tag })}
            </span>
          ))}
          {!!Freehold && <span className={css.tag}>{capitaliseFirstLetter(Freehold)}</span>}
          {author?.id?.uuid && (
            <NamedLink className={css.listedBy} name="ProfilePage" params={{ id: author.id.uuid }}>
              <span className={css.listedBy}>
                {intl.formatMessage({ id: 'ListingPage.aboutProviderTitle' })}:{' '}
                <span className={css.listedByName}>{author.attributes.profile.displayName}</span>
              </span>
            </NamedLink>
          )}
        </div>

        <div className={css.mainInfo}>
          <div className={css.title}>
            {richText(title, {
              longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
              longWordClass: css.longWord,
            })}
          </div>
          <div className={css.cardDetailsBottom}>
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
                    <Icon type="bed" /> {bedrooms}{' '}
                    {intl.formatMessage({ id: 'ListingCard.bedroom' }, { count: bedrooms })}
                  </span>
                )}
                {!!bathrooms && (
                  <span className={css.iconItem}>
                    <Icon type="bath" /> {bathrooms}{' '}
                    {intl.formatMessage({ id: 'ListingCard.bathroom' }, { count: bathrooms })}
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
              />
            </div>
          </div>
        </div>
      </div>
    </NamedLink>
  );
};

export default ListingCard;
