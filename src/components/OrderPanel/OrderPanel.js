import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import loadable from '@loadable/component';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import {
  displayDeliveryPickup,
  displayDeliveryShipping,
  displayPrice,
} from '../../util/configHelpers';
import {
  propTypes,
  AVAILABILITY_MULTIPLE_SEATS,
  LISTING_STATE_CLOSED,
  LINE_ITEM_NIGHT,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_FIXED,
  LINE_ITEM_ITEM,
  STOCK_MULTIPLE_ITEMS,
  STOCK_INFINITE_MULTIPLE_ITEMS,
  LISTING_STATE_PUBLISHED,
} from '../../util/types';
import { convertUnitToSubUnit, formatMoney, unitDivisor } from '../../util/currency';
import { createSlug, parse, stringify } from '../../util/urlHelpers';
import { userDisplayNameAsString } from '../../util/data';
import {
  INQUIRY_PROCESS_NAME,
  getSupportedProcessesInfo,
  isBookingProcess,
  isPurchaseProcess,
  resolveLatestProcessName,
} from '../../transactions/transaction';

import { ModalInMobile, PrimaryButton, AvatarSmall, H1, H2, Button } from '../../components';
import PriceVariantPicker from './PriceVariantPicker/PriceVariantPicker';

import css from './OrderPanel.module.css';

import { types as sdkTypes } from '../../util/sdkLoader';
import { useSelector, useDispatch } from 'react-redux';
import { createShortUrl } from '../../util/api';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { handleToggleFavorites, isFavorite } from '../../util/userFavorites';
import { updateProfile } from '../../containers/ProfileSettingsPage/ProfileSettingsPage.duck';

const { Money } = sdkTypes;

const BookingTimeForm = loadable(() =>
  import(/* webpackChunkName: "BookingTimeForm" */ './BookingTimeForm/BookingTimeForm')
);
const BookingDatesForm = loadable(() =>
  import(/* webpackChunkName: "BookingDatesForm" */ './BookingDatesForm/BookingDatesForm')
);
const BookingFixedDurationForm = loadable(() =>
  import(
    /* webpackChunkName: "BookingFixedDurationForm" */ './BookingFixedDurationForm/BookingFixedDurationForm'
  )
);
const InquiryWithoutPaymentForm = loadable(() =>
  import(
    /* webpackChunkName: "InquiryWithoutPaymentForm" */ './InquiryWithoutPaymentForm/InquiryWithoutPaymentForm'
  )
);
const ProductOrderForm = loadable(() =>
  import(/* webpackChunkName: "ProductOrderForm" */ './ProductOrderForm/ProductOrderForm')
);

// This defines when ModalInMobile shows content as Modal
const MODAL_BREAKPOINT = 1023;
const TODAY = new Date();

const isPublishedListing = listing => {
  return listing.attributes.state === LISTING_STATE_PUBLISHED;
};

const priceData = (price, currency, intl) => {
  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: `(${price.currency})`,
      priceTitle: `Unsupported currency (${price.currency})`,
    };
  }
  return {};
};

const getCheapestPriceVariant = (priceVariants = []) => {
  return priceVariants.reduce((cheapest, current) => {
    return current.priceInSubunits < cheapest.priceInSubunits ? current : cheapest;
  }, priceVariants[0]);
};

const formatMoneyIfSupportedCurrency = (price, intl) => {
  try {
    return formatMoney(intl, price);
  } catch (e) {
    return `(${price.currency})`;
  }
};

const openOrderModal = (isOwnListing, isClosed, history, location) => {
  if (isOwnListing || isClosed) {
    window.scrollTo(0, 0);
  } else {
    const { pathname, search, state } = location;
    const searchString = `?${stringify({ ...parse(search), orderOpen: true })}`;
    history.push(`${pathname}${searchString}`, state);
  }
};

const closeOrderModal = (history, location) => {
  const { pathname, search, state } = location;
  const { orderOpen, ...searchParams } = parse(search);
  const searchString = `?${stringify(searchParams)}`;
  history.push(`${pathname}${searchString}`, state);
};

const handleSubmit = (
  isOwnListing,
  isClosed,
  isInquiryWithoutPayment,
  onSubmit,
  history,
  location
) => {
  // TODO: currently, inquiry-process does not have any form to ask more order data.
  // We can submit without opening any inquiry/order modal.
  return isInquiryWithoutPayment
    ? () => onSubmit({})
    : () => openOrderModal(isOwnListing, isClosed, history, location);
};

const dateFormattingOptions = { month: 'short', day: 'numeric', weekday: 'short' };

const PriceMaybe = props => {
  const {
    price,
    publicData,
    validListingTypes,
    intl,
    marketplaceCurrency,
    showCurrencyMismatch = false,
  } = props;
  const { listingType, unitType } = publicData || {};

  const USDConversionRate = useSelector(state => state.currency.conversionRate?.USD);
  const selectedCurrency = useSelector(state => state.currency.selectedCurrency);
  const needPriceConversion = selectedCurrency === 'USD';

  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  const isPriceVariationsInUse = !!publicData?.priceVariationsEnabled;
  const hasMultiplePriceVariants = publicData?.priceVariants?.length > 1;

  if (!showPrice || !price || (isPriceVariationsInUse && hasMultiplePriceVariants)) {
    return null;
  }

  // Get formatted price or currency code if the currency does not match with marketplace currency
  const { formattedPrice, priceTitle } = priceData(price, marketplaceCurrency, intl);

  const convertedPrice = new Money(price.amount, price.currency);
  if (needPriceConversion) {
    convertedPrice.amount *= USDConversionRate;
    convertedPrice.currency = 'USD';
  }

  const priceValue = (
    <span className={css.priceValue}>{formatMoneyIfSupportedCurrency(convertedPrice, intl)}</span>
  );
  const pricePerUnit = (
    <span className={css.perUnit}>
      <FormattedMessage id="OrderPanel.perUnit" values={{ unitType }} />
    </span>
  );

  // TODO: In CTA, we don't have space to show proper error message for a mismatch of marketplace currency
  //       Instead, we show the currency code in place of the price
  return showCurrencyMismatch ? (
    <div className={css.priceContainerInCTA}>
      <div className={css.priceValueInCTA} title={priceTitle}>
        <FormattedMessage
          id="OrderPanel.priceInMobileCTA"
          values={{ priceValue: formattedPrice }}
        />
      </div>
      <div className={css.perUnitInCTA}>
        <FormattedMessage id="OrderPanel.perUnit" values={{ unitType }} />
      </div>
    </div>
  ) : (
    <div className={css.priceContainer}>
      <p className={css.price}>
        <FormattedMessage id="OrderPanel.price" values={{ priceValue, pricePerUnit }} />
      </p>
    </div>
  );
};

const PriceMissing = () => {
  return (
    <p className={css.error}>
      <FormattedMessage id="OrderPanel.listingPriceMissing" />
    </p>
  );
};
const InvalidCurrency = () => {
  return (
    <p className={css.error}>
      <FormattedMessage id="OrderPanel.listingCurrencyInvalid" />
    </p>
  );
};

const InvalidPriceVariants = () => {
  return (
    <p className={css.error}>
      <FormattedMessage id="OrderPanel.listingPriceVariantsAreInvalid" />
    </p>
  );
};

const hasUniqueVariants = priceVariants => {
  const priceVariantsSlugs = priceVariants?.map(variant =>
    variant.name ? createSlug(variant.name) : 'no-name'
  );
  return new Set(priceVariantsSlugs).size === priceVariants.length;
};

const hasValidPriceVariants = priceVariants => {
  const isArray = Array.isArray(priceVariants);
  const hasItems = isArray && priceVariants.length > 0;
  const variantsHaveNames = hasItems && priceVariants.every(variant => variant.name);
  const namesAreUnique = hasItems && hasUniqueVariants(priceVariants);

  return variantsHaveNames && namesAreUnique;
};

const preparePriceTabs = (publicData, marketplaceCurrency, intl) => {
  if (publicData.categoryLevel1 === 'villaforsale' || publicData.categoryLevel1 === 'landforsale') {
    return [];
  }

  const pricee = publicData?.pricee;

  // Define the correct order
  const correctOrder = ['weekly', 'monthly', 'yearly'];

  // Filter and sort based on correct order, then map to include pricing
  return correctOrder
    .filter(item => pricee?.includes(item))
    .map(item => {
      const priceKey =
        item === 'weekly' ? 'weekprice' : item === 'monthly' ? 'monthprice' : 'yearprice';
      const price = publicData?.[priceKey] || null;

      // Use translated labels with the specified prefix
      const translationKey = `PageBuilder.SearchCTA.PriceFilter.${item}`;

      return {
        key: item,
        label: intl.formatMessage({ id: translationKey }),
        price: price ? new Money(price * 100, marketplaceCurrency) : null,
      };
    });
};

// Helper function to check if a listing is available now based on availableper value
const isAvailableNow = availableper => {
  // Handle legacy "yes"/"no" values
  if (availableper === 'yes') return true;
  if (availableper === 'no') return false;

  // Handle date strings (ISO format: "YYYY-MM-DD")
  if (typeof availableper === 'string' && availableper.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const availableDate = new Date(availableper);
    availableDate.setHours(0, 0, 0, 0);
    return availableDate <= today;
  }

  return false;
};

// Helper function to get the availability display text
const getAvailabilityDisplay = (availableper, intl) => {
  // Handle legacy "yes"/"no" values
  if (availableper === 'yes') return 'Available Now!';
  if (availableper === 'no') return 'Available soon!';

  // Handle date strings (ISO format: "YYYY-MM-DD")
  if (typeof availableper === 'string' && availableper.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const availableDate = new Date(availableper);
    availableDate.setHours(0, 0, 0, 0);

    if (availableDate <= today) {
      return 'Available Now!';
    } else {
      return `Available from ${intl.formatDate(availableDate, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
  }

  // Default case
  return 'Available soon!';
};

/**
 * @typedef {Object} ListingTypeConfig
 * @property {string} listingType - The type of the listing
 * @property {string} transactionType - The type of the transaction
 * @property {string} transactionType.process - The process descriptionof the transaction
 * @property {string} transactionType.alias - The alias of the transaction process
 * @property {string} transactionType.unitType - The unit type of the transaction
 */

/**
 * OrderPanel is a component that renders a panel for making bookings, purchases, or inquiries for a listing.
 * It handles different transaction processes and displays appropriate forms based on the listing type.
 *
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overwrites the default class for the root element
 * @param {string} [props.className] - Custom class that extends
 * @param {string} [props.titleClassName] - Custom class name for the title
 * @param {propTypes.listing} props.listing - The listing data (either regular or own listing)
 * @param {Array<ListingTypeConfig>} props.validListingTypes - Array of valid listing type configurations
 * @param {boolean} [props.isOwnListing=false] - Whether the listing belongs to the current user
 * @param {listingType.user|listingType.currentUser} props.author - The listing author's user data
 * @param {ReactNode} [props.authorLink] - Custom component for rendering the author link
 * @param {ReactNode} [props.payoutDetailsWarning] - Warning message about payout details
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {ReactNode|string} props.title - Title of the panel
 * @param {ReactNode} [props.titleDesktop] - Alternative title for desktop view
 * @param {ReactNode|string} [props.subTitle] - Subtitle text
 * @param {Function} props.onManageDisableScrolling - Handler for managing scroll behavior
 * @param {Function} props.onFetchTimeSlots - Handler for fetching available time slots
 * @param {Object} [props.monthlyTimeSlots] - Available time slots by month
 * @param {Function} props.onFetchTransactionLineItems - Handler for fetching transaction line items
 * @param {Function} [props.onContactUser] - Handler for contacting the listing author
 * @param {Array} [props.lineItems] - Array of line items for the transaction
 * @param {boolean} props.fetchLineItemsInProgress - Whether line items are being fetched
 * @param {Object} [props.fetchLineItemsError] - Error object if line items fetch failed
 * @param {string} props.marketplaceCurrency - The currency used in the marketplace
 * @param {number} props.dayCountAvailableForBooking - Number of days available for booking
 * @param {string} props.marketplaceName - Name of the marketplace
 *
 * @returns {JSX.Element} Component that displays the order panel with appropriate form
 */
const OrderPanel = props => {
  const [mounted, setMounted] = useState(false);
  const [contacting, setContacting] = useState(false);
  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const routes = useRouteConfiguration();
  const tabs = preparePriceTabs(
    props.listing?.attributes?.publicData,
    props.marketplaceCurrency,
    intl
  );
  const [selectedTab, setSelectedTab] = useState(tabs[tabs.length - 1]);

  const USDConversionRate = useSelector(state => state.currency.conversionRate?.USD);
  const selectedCurrency = useSelector(state => state.currency.selectedCurrency);
  const needPriceConversion = selectedCurrency === 'USD';

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    rootClassName,
    className,
    titleClassName,
    listing,
    validListingTypes,
    lineItemUnitType: lineItemUnitTypeMaybe,
    isOwnListing,
    onSubmit,
    title,
    titleDesktop,
    author,
    authorLink,
    onManageDisableScrolling,
    onFetchTimeSlots,
    monthlyTimeSlots,
    timeSlotsForDate,
    onFetchTransactionLineItems,
    onContactUser,
    lineItems,
    marketplaceCurrency,
    dayCountAvailableForBooking,
    marketplaceName,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    payoutDetailsWarning,
    currentUser,
  } = props;

  const publicData = listing?.attributes?.publicData || {};
  const {
    listingType,
    unitType,
    transactionProcessAlias = '',
    priceVariants,
    startTimeInterval,
    availableper,
    categoryLevel1,
    priceperare,
    agentorowner,
    phonenumber,
  } = publicData || {};

  const isVillaforsale = categoryLevel1 === 'villaforsale';
  const isLandforsale = categoryLevel1 === 'landforsale';

  const hideTabs = isVillaforsale || isLandforsale;

  const processName = resolveLatestProcessName(transactionProcessAlias.split('/')[0]);
  const lineItemUnitType = lineItemUnitTypeMaybe || `line-item/${unitType}`;

  const price = listing?.attributes?.price;
  const isPaymentProcess = processName !== INQUIRY_PROCESS_NAME;

  const showPriceMissing = isPaymentProcess && !price;
  const showInvalidCurrency = isPaymentProcess && price?.currency !== marketplaceCurrency;

  const timeZone = listing?.attributes?.availabilityPlan?.timezone;
  const isClosed = listing?.attributes?.state === LISTING_STATE_CLOSED;

  const isBooking = isBookingProcess(processName);
  const shouldHaveFixedBookingDuration = isBooking && [LINE_ITEM_FIXED].includes(lineItemUnitType);
  const showBookingFixedDurationForm =
    mounted && shouldHaveFixedBookingDuration && !isClosed && timeZone && priceVariants?.length > 0;

  const shouldHaveBookingTime = isBooking && [LINE_ITEM_HOUR].includes(lineItemUnitType);
  const showBookingTimeForm = mounted && shouldHaveBookingTime && !isClosed && timeZone;

  const shouldHaveBookingDates =
    isBooking && [LINE_ITEM_DAY, LINE_ITEM_NIGHT].includes(lineItemUnitType);
  const showBookingDatesForm = mounted && shouldHaveBookingDates && !isClosed && timeZone;

  // The listing resource has a relationship: `currentStock`,
  // which you should include when making API calls.
  const isPurchase = isPurchaseProcess(processName);
  const shouldHavePurchase = isPurchase && lineItemUnitType === LINE_ITEM_ITEM;
  const currentStock = listing.currentStock?.attributes?.quantity;
  const isOutOfStock = shouldHavePurchase && !isClosed && currentStock === 0;

  // Show form only when stock is fully loaded. This avoids "Out of stock" UI by
  // default before all data has been downloaded.
  const showProductOrderForm =
    mounted && shouldHavePurchase && !isClosed && typeof currentStock === 'number';

  const showInquiryForm = mounted && !isClosed && processName === INQUIRY_PROCESS_NAME;

  const supportedProcessesInfo = getSupportedProcessesInfo();
  const isKnownProcess = supportedProcessesInfo.map(info => info.name).includes(processName);

  const { pickupEnabled, shippingEnabled } = listing?.attributes?.publicData || {};

  const listingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const displayShipping = displayDeliveryShipping(listingTypeConfig);
  const displayPickup = displayDeliveryPickup(listingTypeConfig);
  const allowOrdersOfMultipleItems = [STOCK_MULTIPLE_ITEMS, STOCK_INFINITE_MULTIPLE_ITEMS].includes(
    listingTypeConfig?.stockType
  );

  const searchParams = parse(location.search);
  const isOrderOpen = !!searchParams.orderOpen;
  const preselectedPriceVariantSlug = searchParams.bookableOption;

  const seatsEnabled = [AVAILABILITY_MULTIPLE_SEATS].includes(listingTypeConfig?.availabilityType);

  // Note: publicData contains priceVariationsEnabled if listing is created with priceVariations enabled.
  const isPriceVariationsInUse = !!publicData?.priceVariationsEnabled;
  const preselectedPriceVariant =
    Array.isArray(priceVariants) && preselectedPriceVariantSlug && isPriceVariationsInUse
      ? priceVariants.find(pv => pv?.name && createSlug(pv?.name) === preselectedPriceVariantSlug)
      : null;

  const priceVariantsMaybe = isPriceVariationsInUse
    ? {
        isPriceVariationsInUse,
        priceVariants,
        priceVariantFieldComponent: PriceVariantPicker,
        preselectedPriceVariant,
        isPublishedListing: isPublishedListing(listing),
      }
    : !isPriceVariationsInUse && showBookingFixedDurationForm
    ? {
        isPriceVariationsInUse: false,
        priceVariants: [getCheapestPriceVariant(priceVariants)],
        priceVariantFieldComponent: PriceVariantPicker,
      }
    : {};

  const showInvalidPriceVariantsMessage =
    isPriceVariationsInUse && !hasValidPriceVariants(priceVariants);

  const sharedProps = {
    lineItemUnitType,
    onSubmit,
    price,
    marketplaceCurrency,
    listingId: listing.id,
    isOwnListing,
    marketplaceName,
    onFetchTransactionLineItems,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    payoutDetailsWarning,
  };

  const showClosedListingHelpText = listing.id && isClosed;

  const subTitleText = showClosedListingHelpText
    ? intl.formatMessage({ id: 'OrderPanel.subTitleClosedListing' })
    : null;

  const authorDisplayName = userDisplayNameAsString(author, '');

  const classes = classNames(rootClassName || css.root, className);
  const titleClasses = classNames(titleClassName || css.orderTitle);

  const handleWhatsappClick = async () => {
    if (contacting) {
      return;
    }

    if (!currentUser) {
      const currentUrl = window.location.pathname + window.location.search;
      history.push({
        pathname: '/login',
        state: { from: currentUrl },
      });
      return;
    }

    const listingId = listing.id.uuid;
    const isFav = isFavorite(currentUser, listingId);

    if (!isFav) {
      setContacting(true);
      handleToggleFavorites({
        currentUser,
        history,
        location,
        routes,
        params: { id: listingId },
        onUpdateFavorites: payload => dispatch(updateProfile(payload)),
      })(false);
    }

    const openWhatsapp = () => {
      const cleanedNumber = phonenumber ? phonenumber.replace(/\D/g, '') : '';
      if (cleanedNumber) {
        const currentUrl = window.location.href;
        const hostUrl = `${window.location.protocol}//${window.location.host}`;

        let shortUrl = currentUrl;
        createShortUrl({ url: currentUrl })
          .then(response => {
            shortUrl = response.shortUrl;
          })
          .catch(error => {
            // console.error('Error generating short URL:', error);
          })
          .finally(() => {
            const message = `Hi, I'm contacting you about a listing I found on ${hostUrl}. I'm interested in this property: ${shortUrl}. Can we discuss details?`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');

            if (window.gtag) {
              window.gtag('event', 'click_contact_owner', {
                category: 'engagement',
                listing_id: listing.attributes.id,
                clicker: currentUser.attributes.email,
                contact_value: 1,
              });
            }

            if (window.fbq) {
              fbq('track', 'Click Contact Owner', {
                listing_id: listing.id,
                listing_name: listing.attributes.title,
              });
            }
            setContacting(false);
          });
      } else {
        setContacting(false);
      }
    };

    if (isFav) {
      openWhatsapp();
    } else {
      setTimeout(openWhatsapp, 1000);
    }
  };

  const listingIsAvailableNow = isAvailableNow(availableper);
  // const availabilityDisplayText = getAvailabilityDisplay(availableper, intl);

  return (
    <div className={classes}>
      {listingIsAvailableNow && (
        <div className={classNames(css.availableNowButton, css.availableNowButtonDesktop)}>
          {intl.formatMessage({ id: 'OrderPanel.availableNow' })}
        </div>
      )}
      <ModalInMobile
        containerClassName={css.modalContainer}
        id="OrderFormInModal"
        isModalOpenOnMobile={isOrderOpen}
        onClose={() => closeOrderModal(history, location)}
        showAsModalMaxWidth={MODAL_BREAKPOINT}
        onManageDisableScrolling={onManageDisableScrolling}
        usePortal
      >
        <div className={css.modalHeading}>
          <H1 className={css.heading}>{title}</H1>
        </div>

        <div className={css.orderHeading}>
          {/* {titleDesktop ? titleDesktop : <H2 className={titleClasses}>{title}</H2>} */}
          {subTitleText ? <div className={css.orderHelp}>{subTitleText}</div> : null}
        </div>
        {!hideTabs && (
          <div className={css.tabsContainer}>
            {tabs.map(elm => (
              <button
                key={elm.key}
                type="button"
                className={classNames(css.tabButton, {
                  [css.tabButtonSelected]: selectedTab.key === elm.key,
                })}
                onClick={() => setSelectedTab(elm)}
              >
                {elm.label}
              </button>
            ))}
          </div>
        )}
        <h4 className={css.priceHeading}>{intl.formatMessage({ id: 'OrderPanel.priceTitle' })}</h4>
        <PriceMaybe
          price={hideTabs ? price : selectedTab?.price}
          publicData={publicData}
          validListingTypes={validListingTypes}
          intl={intl}
          marketplaceCurrency={marketplaceCurrency}
        />
        {/* {!listingIsAvailableNow && !hideTabs && (
          <div className={css.availableFrom}>{availabilityDisplayText}</div>
        )} */}
        {priceperare && (
          <div className={css.availableFrom}>
            {intl.formatMessage({ id: 'OrderPanel.pricePerAre' })}:{' '}
            {formatMoneyIfSupportedCurrency(
              new Money(
                convertUnitToSubUnit(
                  needPriceConversion ? Math.ceil(priceperare * USDConversionRate) : priceperare,
                  unitDivisor(marketplaceCurrency)
                ),
                selectedCurrency
              ),
              intl
            )}
          </div>
        )}
        {/* <div className={css.author}>
          <AvatarSmall user={author} className={css.providerAvatar} />
          <span className={css.providerNameLinked}>
            <FormattedMessage id="OrderPanel.author" values={{ name: authorLink }} />
          </span>
          <span className={css.providerNamePlain}>
            <FormattedMessage id="OrderPanel.author" values={{ name: authorDisplayName }} />
          </span>
        </div> */}

        {showPriceMissing ? (
          <PriceMissing />
        ) : showInvalidCurrency ? (
          <InvalidCurrency />
        ) : showInvalidPriceVariantsMessage ? (
          <InvalidPriceVariants />
        ) : showBookingFixedDurationForm ? (
          <BookingFixedDurationForm
            seatsEnabled={seatsEnabled}
            className={css.bookingForm}
            formId="OrderPanelBookingFixedDurationForm"
            dayCountAvailableForBooking={dayCountAvailableForBooking}
            monthlyTimeSlots={monthlyTimeSlots}
            timeSlotsForDate={timeSlotsForDate}
            onFetchTimeSlots={onFetchTimeSlots}
            startDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            startTimeInterval={startTimeInterval}
            timeZone={timeZone}
            {...priceVariantsMaybe}
            {...sharedProps}
          />
        ) : showBookingTimeForm ? (
          <BookingTimeForm
            seatsEnabled={seatsEnabled}
            className={css.bookingForm}
            formId="OrderPanelBookingTimeForm"
            dayCountAvailableForBooking={dayCountAvailableForBooking}
            monthlyTimeSlots={monthlyTimeSlots}
            timeSlotsForDate={timeSlotsForDate}
            onFetchTimeSlots={onFetchTimeSlots}
            startDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            endDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            timeZone={timeZone}
            {...priceVariantsMaybe}
            {...sharedProps}
          />
        ) : showBookingDatesForm ? (
          <BookingDatesForm
            seatsEnabled={seatsEnabled}
            className={css.bookingForm}
            formId="OrderPanelBookingDatesForm"
            dayCountAvailableForBooking={dayCountAvailableForBooking}
            monthlyTimeSlots={monthlyTimeSlots}
            onFetchTimeSlots={onFetchTimeSlots}
            timeZone={timeZone}
            {...priceVariantsMaybe}
            {...sharedProps}
          />
        ) : showProductOrderForm ? (
          <ProductOrderForm
            formId="OrderPanelProductOrderForm"
            currentStock={currentStock}
            allowOrdersOfMultipleItems={allowOrdersOfMultipleItems}
            pickupEnabled={pickupEnabled && displayPickup}
            shippingEnabled={shippingEnabled && displayShipping}
            displayDeliveryMethod={displayPickup || displayShipping}
            onContactUser={onContactUser}
            {...sharedProps}
          />
        ) : showInquiryForm ? (
          <InquiryWithoutPaymentForm
            formId="OrderPanelInquiryForm"
            onSubmit={onSubmit}
            agentorowner={agentorowner}
            handleWhatsappClick={handleWhatsappClick}
            contacting={contacting}
          />
        ) : !isKnownProcess ? (
          <p className={css.errorSidebar}>
            <FormattedMessage id="OrderPanel.unknownTransactionProcess" />
          </p>
        ) : null}
      </ModalInMobile>
      <div className={css.openOrderForm}>
        <div className={css.openOrderFormContainer}>
          <div>
            {listingIsAvailableNow && (
              <div className={classNames(css.availableNowButton, css.availableNowButtonMobile)}>
                {intl.formatMessage({ id: 'OrderPanel.availableNow' })}
              </div>
            )}
            {!hideTabs && (
              <div className={css.tabsContainer}>
                {tabs.map(elm => (
                  <button
                    key={elm.key}
                    type="button"
                    className={classNames(css.tabButton, {
                      [css.tabButtonSelected]: selectedTab.key === elm.key,
                    })}
                    onClick={() => setSelectedTab(elm)}
                  >
                    {elm.label}
                  </button>
                ))}
              </div>
            )}

            <div className={css.priceContainerWrapper}>
              <div>
                <h4 className={css.priceHeading}>Price</h4>
                <PriceMaybe
                  price={hideTabs ? price : selectedTab?.price}
                  publicData={publicData}
                  validListingTypes={validListingTypes}
                  intl={intl}
                  marketplaceCurrency={marketplaceCurrency}
                  showCurrencyMismatch
                />
                {/* {!listingIsAvailableNow && !hideTabs && (
                  <div className={css.availableFrom}>{availabilityDisplayText}</div>
                )} */}
              </div>
              {isClosed ? (
                <div className={css.closedListingButton}>
                  <FormattedMessage id="OrderPanel.closedListingButtonText" />
                </div>
              ) : (
                <PrimaryButton
                  onClick={handleWhatsappClick}
                  type="button"
                  disabled={isOutOfStock}
                  className={css.openOrderFormButton}
                >
                  {isBooking ? (
                    <FormattedMessage id="OrderPanel.ctaButtonMessageBooking" />
                  ) : isOutOfStock ? (
                    <FormattedMessage id="OrderPanel.ctaButtonMessageNoStock" />
                  ) : isPurchase ? (
                    <FormattedMessage id="OrderPanel.ctaButtonMessagePurchase" />
                  ) : (
                    <>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M14.8651 13.403C14.4109 13.5886 14.1208 14.2997 13.8264 14.663C13.6754 14.8491 13.4954 14.8781 13.2634 14.7848C11.5586 14.1056 10.2517 12.968 9.31091 11.3991C9.15153 11.1558 9.18013 10.9636 9.37231 10.7377C9.65637 10.403 10.0136 10.0228 10.0904 9.57187C10.2611 8.57438 8.957 5.48016 7.23481 6.88219C2.27919 10.9205 15.5017 21.6309 17.8881 15.8381C18.5631 14.1961 15.6179 13.0945 14.8651 13.403ZM12.0001 21.9037C10.2475 21.9037 8.52294 21.4378 7.01309 20.5556C6.77075 20.4136 6.47778 20.3761 6.20684 20.4497L2.92606 21.3502L4.06888 18.8325C4.2245 18.4898 4.18466 18.0909 3.96481 17.7863C2.74231 16.0917 2.09591 14.0911 2.09591 12C2.09591 6.53859 6.53872 2.09578 12.0001 2.09578C17.4615 2.09578 21.9039 6.53859 21.9039 12C21.9039 17.4609 17.4611 21.9037 12.0001 21.9037ZM12.0001 0C5.38325 0 0.000125453 5.38312 0.000125453 12C0.000125453 14.3278 0.661063 16.5633 1.91684 18.5034L0.0938755 22.5183C-0.0744058 22.8891 -0.0129995 23.3231 0.250438 23.632C0.452938 23.8687 0.745907 24 1.04825 24C1.72419 24 5.40997 22.8417 6.34794 22.5844C8.08184 23.512 10.0267 24 12.0001 24C18.6165 24 24.0001 18.6164 24.0001 12C24.0001 5.38312 18.6165 0 12.0001 0Z"
                          fill="white"
                        />
                      </svg>
                      {agentorowner === 'agent' ? (
                        <FormattedMessage id="OrderPanel.contactAgent" />
                      ) : (
                        <FormattedMessage id="OrderPanel.contactOwner" />
                      )}
                    </>
                  )}
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;
