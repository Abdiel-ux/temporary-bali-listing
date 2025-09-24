import classNames from 'classnames';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';

import Slider from 'react-slick';
import { IconCollection, NamedLink } from '../../components';
import { displayPrice } from '../../util/configHelpers';
import { ensureListing, ensureUser } from '../../util/data';
import { useIntl } from '../../util/reactIntl';
import { richText } from '../../util/richText';
import { createSlug } from '../../util/urlHelpers';

import { Icon } from '../../containers/PageBuilder/SectionBuilder/SectionArticle/PropertyCards';
import { capitaliseFirstLetter, sortTags } from '../../util/helper';
import css from './ListingCard.module.css';
import { handleToggleFavorites } from '../../util/userFavorites';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { useLocation, useHistory } from 'react-router-dom';

// added imports for unfavorite wiring
import { removeFavoriteOnProfile } from '../../ducks/user.duck';
import { unfavoriteListing } from '../../containers/FavoriteListingsPage/FavoriteListingsPage.duck';

const MIN_LENGTH_FOR_LONG_WORDS = 10;

// react-slick settings
const sliderSettings = {
  dots: true,
  arrows: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  lazyLoad: 'progressive',
  appendDots: dots => (
    <div className={css.dots}>
      <span className={css.dotsCounter}>
        {dots.findIndex(dot => 
          dot.props.className && dot.props.className.includes('slick-active')
        ) + 1}/{dots.length}
      </span>
    </div>
  ),
  customPaging: i => <button className={css.dot}>{i + 1}</button>,
  nextArrow: (
    <button className={css.arrowRight} type="button" aria-label="Next image">
      <span className={css.arrowIcon}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" rx="12" fill="white" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.4965 11.6908C14.5784 11.7728 14.6244 11.884 14.6244 12C14.6244 12.1159 14.5784 12.2271 14.4965 12.3091L10.1215 16.6841C10.0386 16.7614 9.92887 16.8035 9.81552 16.8015C9.70218 16.7995 9.59404 16.7536 9.51388 16.6734C9.43373 16.5932 9.38781 16.4851 9.38581 16.3718C9.38381 16.2584 9.42588 16.1487 9.50316 16.0658L13.569 12L9.50316 7.93412C9.42588 7.85118 9.38381 7.74149 9.38581 7.62815C9.38781 7.5148 9.43373 7.40666 9.51388 7.32651C9.59404 7.24635 9.70218 7.20043 9.81552 7.19843C9.92887 7.19643 10.0386 7.2385 10.1215 7.31578L14.4965 11.6908Z"
            fill="#231F20"
          />
        </svg>
      </span>
    </button>
  ),
  prevArrow: (
    <button className={css.arrowLeft} type="button" aria-label="Previous image">
      <span className={css.arrowIcon}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" rx="12" transform="matrix(-1 0 0 1 24 0)" fill="white" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.5035 11.6908C9.42157 11.7728 9.37556 11.884 9.37556 12C9.37556 12.1159 9.42157 12.2271 9.5035 12.3091L13.8785 16.6841C13.9614 16.7614 14.0711 16.8035 14.1845 16.8015C14.2978 16.7995 14.406 16.7536 14.4861 16.6734C14.5663 16.5932 14.6122 16.4851 14.6142 16.3718C14.6162 16.2584 14.5741 16.1487 14.4968 16.0658L10.431 12L14.4968 7.93412C14.5741 7.85118 14.6162 7.74149 14.6142 7.62815C14.6122 7.5148 14.5663 7.40666 14.4861 7.32651C14.406 7.24635 14.2978 7.20043 14.1845 7.19843C14.0711 7.19643 13.9614 7.2385 13.8785 7.31578L9.5035 11.6908Z"
            fill="#231F20"
          />
        </svg>
      </span>
    </button>
  ),
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

export const checkPriceParams = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const weekprice = urlParams.get('pub_weekprice') || null;
    const monthprice = urlParams.get('pub_monthprice') || null;
    const yearprice = urlParams.get('pub_yearprice') || null;

    return { weekprice, monthprice, yearprice };
  }
};

// Helper function untuk mencari image URL yang valid dari berbagai variant
const findValidImageUrl = (img, imageIndex) => {
  // ... same as before (omitted for brevity in canvas) ...
  let imageUrl = null;

  const possibleVariants = [
    'landscape-crop2x',
    'landscape-crop',
    'scaled-small',
    'scaled-medium', 
    'scaled-large',
    'default'
  ];

  for (const variant of possibleVariants) {
    imageUrl = img?.attributes?.variants?.[variant]?.url;
    if (imageUrl) break;
  }

  if (!imageUrl) imageUrl = img?.attributes?.url;
  return imageUrl;
};

const processListingImages = (currentListing) => {
  if (!currentListing.images || !Array.isArray(currentListing.images)) return [];
  const processedImages = [];
  currentListing.images.forEach((img) => {
    const validUrl = findValidImageUrl(img);
    if (validUrl) processedImages.push(validUrl);
  });
  return processedImages;
};

const PriceMaybe = props => {
  const { price, publicData, config, isRentals } = props;
  const { listingType, weekprice, monthprice, yearprice } = publicData || {};
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  if (!showPrice && price) {
    return null;
  }

  const priceParams = checkPriceParams();

  let rentalPrice = price;
  if (isRentals) {
    if (priceParams?.yearprice) {
      rentalPrice = yearprice;
    } else if (priceParams?.monthprice) {
      rentalPrice = monthprice;
    } else if (priceParams?.weekprice) {
      rentalPrice = weekprice;
    } else if (publicData?.monthprice) {
      rentalPrice = monthprice;
    } else if (publicData?.weekprice) {
      rentalPrice = weekprice;
    } else if (publicData?.yearprice) {
      rentalPrice = yearprice;
    }
  }

  const formattedPrice = rentalPrice ? formatPriceInMillions(rentalPrice) : null;

  let suffix;
  if (priceParams?.weekprice || priceParams?.monthprice || priceParams?.yearprice) {
    if (priceParams.weekprice) {
      suffix = '/ weekly';
    } else if (priceParams.monthprice) {
      suffix = '/ monthly';
    } else if (priceParams.yearprice) {
      suffix = '/ yearly';
    }
  } else {
    if (publicData?.monthprice) {
      suffix = '/ monthly';
    } else if (publicData?.weekprice) {
      suffix = '/ weekly';
    } else if (publicData?.yearprice) {
      suffix = '/ yearly';
    }
  }

  return (
    <div className={css.price}>
      <span className={css.priceValue}>
        {formattedPrice} IDR
        {isRentals && <span>{suffix}</span>}
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
    showWishlistButton = true ,
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

  // === PROSES GAMBAR ===
  const processedImageUrls = processListingImages(currentListing);
  const hasValidImages = processedImageUrls.length > 0;
  const displayImages = hasValidImages ? processedImageUrls : ['/images/placeholder-property.jpg'];

  const cardSliderSettings = {
    ...sliderSettings,
    infinite: displayImages.length > 1,
  };

  const dispatch = useDispatch();
  const isFavorite = currentUser?.attributes.profile.privateData.favorites?.includes(id);

  // NEW: custom onToggleFavorites that mirrors "tong sampah" behavior for UNFAVORITE
  const onToggleFavorites = e => {
    e.preventDefault();
    e.stopPropagation();

    // customOnUpdate akan dipanggil oleh handleToggleFavorites
    const customOnUpdate = payload => {
      if (isFavorite) {
        // UNFAVORITE: panggil thunk user.duck yang sudah mengupdate profile di server
        dispatch(removeFavoriteOnProfile(id))
          .then(() => {
            // Setelah backend sukses, update page-level state agar listing hilang dari FavoriteListings
            dispatch(unfavoriteSuccess(id));
          })
          .catch(err => {
            console.error('Unfavorite failed:', err);
          });
      } else {
        // FAVORITE: forward payload ke onUpdateFavorites jika parent menyediakan
        if (typeof onUpdateFavorites === 'function') {
          onUpdateFavorites(payload);
        } else {
          // fallback: log (atau Anda bisa dispatch addFavorite thunk jika tersedia)
          console.log('Favoriting not wired: payload=', payload);
        }
      }
    };

    // Panggil util handleToggleFavorites (tetap menjaga redirect/login flow)
    handleToggleFavorites({
      location: routeLocation,
      history,
      routes,
      currentUser,
      params: { id },
      onUpdateFavorites: customOnUpdate,
    })(isFavorite);
  };

  return (
    <NamedLink name="ListingPage" params={{ id, slug }} className={classes}>
      {showWishlistButton && (
      <button 
        className={classNames(css.wishlistButton, isFavorite ? css.active : '')} 
        onClick={onToggleFavorites}>
        <IconCollection name="icon-waislist" />
      </button>
      )}

      <div className={css.imageWrapper}>
        <Slider {...cardSliderSettings} className={css.slider}>
          {displayImages.map((imageUrl, imgIdx) => {
            return (
              <div key={imgIdx}>
                <img 
                  src={imageUrl} 
                  alt={title || `Property image ${imgIdx + 1}`}
                  className={css.image + ' ' + css.imageFade}
                  onError={(e) => {
                    if (e.target.src !== '/images/placeholder-property.jpg') {
                      e.target.src = '/images/placeholder-property.jpg';
                    }
                  }}
                />
              </div>
            );
          })}
        </Slider>
      </div>
      <div className={css.info}>
        <div className={css.tags}>
          {tags?.map(tag => (
            <span className={css.tag} key={tag}>
              {tag}
            </span>
          ))}
          {!!Freehold && <span className={css.tag}>{capitaliseFirstLetter(Freehold)}</span>}
          {author?.id?.uuid && (
            <NamedLink className={css.listedBy} name="ProfilePage" params={{ id: author.id.uuid }}>
              <span className={css.listedBy}>
                Listed by:{' '}
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
            />
          </div>
        </div>
      </div>
    </NamedLink>
  );
};

export default ListingCard;
// End of recent edits