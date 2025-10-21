import React, { Component } from 'react';
import classNames from 'classnames';
import debounce from 'lodash/debounce';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';

import IconHourGlass from './IconHourGlass';
import IconCurrentLocation from './IconCurrentLocation';
import * as geocoderMapbox from './GeocoderMapbox';
import * as geocoderGoogleMaps from './GeocoderGoogleMaps';

import css from './LocationAutocompleteInput.module.css';
import EventBus from '../../util/EventBus';
import IconCollection from '../IconCollection/IconCollection';

const DEBOUNCE_WAIT_TIME = 300;
const DEBOUNCE_WAIT_TIME_FOR_SHORT_QUERIES = 1000;
const KEY_CODE_ARROW_UP = 38;
const KEY_CODE_ARROW_DOWN = 40;
const KEY_CODE_ENTER = 13;
const KEY_CODE_TAB = 9;
const KEY_CODE_ESC = 27;
const DIRECTION_UP = 'up';
const DIRECTION_DOWN = 'down';
const TOUCH_TAP_RADIUS = 5; // Movement within 5px from touch start is considered a tap

// Touch devices need to be able to distinguish touches for scrolling and touches to tap
const getTouchCoordinates = nativeEvent => {
  const touch = nativeEvent && nativeEvent.changedTouches ? nativeEvent.changedTouches[0] : null;
  return touch ? { x: touch.screenX, y: touch.screenY } : null;
};

// Get correct geocoding variant: geocoderGoogleMaps or geocoderMapbox
const getGeocoderVariant = mapProvider => {
  const isGoogleMapsInUse = mapProvider === 'googleMaps';
  return isGoogleMapsInUse ? geocoderGoogleMaps : geocoderMapbox;
};

// Renders the autocompletion prediction results in a list
const LocationPredictionsList = React.forwardRef((props, ref) => {
  const {
    rootClassName,
    className,
    useDarkText,
    children,
    predictions,
    currentLocationId,
    geocoder,
    isGoogleMapsInUse,
    highlightedIndex,
    onSelectStart,
    onSelectMove,
    onSelectEnd,
    dropdownInput,
    onCloseDropdown,
    isMobile,
    onClearInput,
    onNext = () => {},
  } = props;
  // On mobile, always render the dropdown container, even if predictions are empty
  if (predictions.length === 0 && isMobile) {
    const predictionRootMapProviderClass = isGoogleMapsInUse
      ? css.predictionsRootGoogle
      : css.predictionsRootMapbox;
    const classes = classNames(
      rootClassName || css.predictionsRoot,
      predictionRootMapProviderClass,
      className
    );
    return (
      <div className={classes} ref={ref}>
        <ul className={css.predictions}>
          <li className={css.menuItemMobile}>
            <h2 className={css.menuItemMobileTitle}>
              <span className={css.menuItemMobileTitleIcon}>
                <svg
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.655 15.2633L6.7075 15.2933L6.7285 15.3053C6.81177 15.3503 6.90495 15.3739 6.99963 15.3739C7.0943 15.3739 7.18748 15.3503 7.27075 15.3053L7.29175 15.294L7.345 15.2633C7.63834 15.0893 7.92457 14.9037 8.203 14.7067C8.92381 14.1979 9.59728 13.625 10.2153 12.9952C11.6733 11.5027 13.1875 9.26025 13.1875 6.375C13.1875 4.73397 12.5356 3.16016 11.3752 1.99978C10.2148 0.839395 8.64103 0.1875 7 0.1875C5.35897 0.1875 3.78516 0.839395 2.62478 1.99978C1.4644 3.16016 0.8125 4.73397 0.8125 6.375C0.8125 9.2595 2.3275 11.5027 3.78475 12.9952C4.40248 13.625 5.07571 14.1978 5.79625 14.7067C6.07493 14.9037 6.36141 15.0893 6.655 15.2633ZM7 8.625C7.59674 8.625 8.16903 8.38795 8.59099 7.96599C9.01295 7.54403 9.25 6.97174 9.25 6.375C9.25 5.77826 9.01295 5.20597 8.59099 4.78401C8.16903 4.36205 7.59674 4.125 7 4.125C6.40326 4.125 5.83097 4.36205 5.40901 4.78401C4.98705 5.20597 4.75 5.77826 4.75 6.375C4.75 6.97174 4.98705 7.54403 5.40901 7.96599C5.83097 8.38795 6.40326 8.625 7 8.625Z"
                    fill="#4D4D4D"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.655 15.2633L6.7075 15.2933L6.7285 15.3053C6.81177 15.3503 6.90495 15.3739 6.99963 15.3739C7.0943 15.3739 7.18748 15.3503 7.27075 15.3053L7.29175 15.294L7.345 15.2633C7.63834 15.0893 7.92457 14.9037 8.203 14.7067C8.92381 14.1979 9.59728 13.625 10.2153 12.9952C11.6733 11.5027 13.1875 9.26025 13.1875 6.375C13.1875 4.73397 12.5356 3.16016 11.3752 1.99978C10.2148 0.839395 8.64103 0.1875 7 0.1875C5.35897 0.1875 3.78516 0.839395 2.62478 1.99978C1.4644 3.16016 0.8125 4.73397 0.8125 6.375C0.8125 9.2595 2.3275 11.5027 3.78475 12.9952C4.40248 13.625 5.07571 14.1978 5.79625 14.7067C6.07493 14.9037 6.36141 15.0893 6.655 15.2633ZM7 8.625C7.59674 8.625 8.16903 8.38795 8.59099 7.96599C9.01295 7.54403 9.25 6.97174 9.25 6.375C9.25 5.77826 9.01295 5.20597 8.59099 4.78401C8.16903 4.36205 7.59674 4.125 7 4.125C6.40326 4.125 5.83097 4.36205 5.40901 4.78401C4.98705 5.20597 4.75 5.77826 4.75 6.375C4.75 6.97174 4.98705 7.54403 5.40901 7.96599C5.83097 8.38795 6.40326 8.625 7 8.625Z"
                    fill="black"
                    fillOpacity="0.2"
                  />
                </svg>
              </span>
              Location
            </h2>
            <span className={css.closeIcon} onClick={isMobile ? onClearInput : onCloseDropdown}>
              <IconCollection name="close_icon" />
            </span>
          </li>
          <li className={css.searchInputMobile}>{dropdownInput}</li>
          <li className={css.listItemBlackText} style={{ textAlign: 'center', padding: '20px 0' }}>
            No results found
          </li>
        </ul>
        {children}
      </div>
    );
  } else if (predictions.length === 0) {
    return null;
  }

  const item = (prediction, index) => {
    const isHighlighted = index === highlightedIndex;
    const predictionId = geocoder.getPredictionId(prediction);

    return (
      <li
        className={classNames(
          isHighlighted ? css.highlighted : null,
          useDarkText ? css.listItemBlackText : css.listItemWhiteText
        )}
        key={predictionId}
        onTouchStart={e => {
          e.preventDefault();
          onSelectStart(getTouchCoordinates(e.nativeEvent));
        }}
        onMouseDown={e => {
          e.preventDefault();
          onSelectStart();
        }}
        onTouchMove={e => {
          e.preventDefault();
          onSelectMove(getTouchCoordinates(e.nativeEvent));
        }}
        onTouchEnd={e => {
          e.preventDefault();
          onSelectEnd(prediction);
        }}
        onMouseUp={e => {
          e.preventDefault();
          onSelectEnd(prediction);
        }}
      >
        {predictionId === currentLocationId ? (
          <div className={css.currentLocation}>
            <IconCurrentLocation />
            <div>
              <div className={css.currentLocationText}>
                <FormattedMessage id="LocationAutocompleteInput.currentLocation" />
              </div>
              <div className={css.currentLocationSubtext}>Discover listings near you</div>
            </div>
          </div>
        ) : (
          <>
            <svg
              width="20"
              height="24"
              viewBox="0 0 20 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 6.09717C7.79086 6.09717 6 7.91704 6 10.162C6 12.4069 7.79086 14.2268 10 14.2268C12.2091 14.2268 14 12.4069 14 10.162C14 7.91704 12.2091 6.09717 10 6.09717ZM8 10.162C8 9.0395 8.89543 8.12957 10 8.12957C11.1046 8.12957 12 9.0395 12 10.162C12 11.2844 11.1046 12.1944 10 12.1944C8.89543 12.1944 8 11.2844 8 10.162Z"
                fill="#6B7280"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.0711 2.97637C13.1658 -0.992124 6.83417 -0.992124 2.92893 2.97637C-0.97631 6.94487 -0.97631 13.3791 2.92893 17.3476L9.10433 23.623C9.59899 24.1257 10.401 24.1257 10.8957 23.623L17.0711 17.3476C20.9763 13.3791 20.9763 6.94487 17.0711 2.97637ZM4.34315 4.41349C7.46734 1.2387 12.5327 1.2387 15.6569 4.41349C18.781 7.58829 18.781 12.7357 15.6569 15.9105L10 21.6589L4.34315 15.9105C1.21895 12.7357 1.21895 7.58829 4.34315 4.41349Z"
                fill="#6B7280"
              />
            </svg>
            {geocoder.getPredictionAddress(prediction)}
          </>
        )}
      </li>
    );
  };

  const predictionRootMapProviderClass = isGoogleMapsInUse
    ? css.predictionsRootGoogle
    : css.predictionsRootMapbox;
  const classes = classNames(
    rootClassName || css.predictionsRoot,
    predictionRootMapProviderClass,
    className
  );

  return (
    <div className={classes} ref={ref}>
      {!isMobile && <div className={css.closeDropdown} onClick={onCloseDropdown} />}
      <ul className={css.predictions}>
        <li className={css.menuItemMobile}>
          <h2 className={css.menuItemMobileTitle}>
            <span className={css.menuItemMobileTitleIcon}>
              <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.655 15.2633L6.7075 15.2933L6.7285 15.3053C6.81177 15.3503 6.90495 15.3739 6.99963 15.3739C7.0943 15.3739 7.18748 15.3503 7.27075 15.3053L7.29175 15.294L7.345 15.2633C7.63834 15.0893 7.92457 14.9037 8.203 14.7067C8.92381 14.1979 9.59728 13.625 10.2153 12.9952C11.6733 11.5027 13.1875 9.26025 13.1875 6.375C13.1875 4.73397 12.5356 3.16016 11.3752 1.99978C10.2148 0.839395 8.64103 0.1875 7 0.1875C5.35897 0.1875 3.78516 0.839395 2.62478 1.99978C1.4644 3.16016 0.8125 4.73397 0.8125 6.375C0.8125 9.2595 2.3275 11.5027 3.78475 12.9952C4.40248 13.625 5.07571 14.1978 5.79625 14.7067C6.07493 14.9037 6.36141 15.0893 6.655 15.2633ZM7 8.625C7.59674 8.625 8.16903 8.38795 8.59099 7.96599C9.01295 7.54403 9.25 6.97174 9.25 6.375C9.25 5.77826 9.01295 5.20597 8.59099 4.78401C8.16903 4.36205 7.59674 4.125 7 4.125C6.40326 4.125 5.83097 4.36205 5.40901 4.78401C4.98705 5.20597 4.75 5.77826 4.75 6.375C4.75 6.97174 4.98705 7.54403 5.40901 7.96599C5.83097 8.38795 6.40326 8.625 7 8.625Z"
                  fill="#4D4D4D"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.655 15.2633L6.7075 15.2933L6.7285 15.3053C6.81177 15.3503 6.90495 15.3739 6.99963 15.3739C7.0943 15.3739 7.18748 15.3503 7.27075 15.3053L7.29175 15.294L7.345 15.2633C7.63834 15.0893 7.92457 14.9037 8.203 14.7067C8.92381 14.1979 9.59728 13.625 10.2153 12.9952C11.6733 11.5027 13.1875 9.26025 13.1875 6.375C13.1875 4.73397 12.5356 3.16016 11.3752 1.99978C10.2148 0.839395 8.64103 0.1875 7 0.1875C5.35897 0.1875 3.78516 0.839395 2.62478 1.99978C1.4644 3.16016 0.8125 4.73397 0.8125 6.375C0.8125 9.2595 2.3275 11.5027 3.78475 12.9952C4.40248 13.625 5.07571 14.1978 5.79625 14.7067C6.07493 14.9037 6.36141 15.0893 6.655 15.2633ZM7 8.625C7.59674 8.625 8.16903 8.38795 8.59099 7.96599C9.01295 7.54403 9.25 6.97174 9.25 6.375C9.25 5.77826 9.01295 5.20597 8.59099 4.78401C8.16903 4.36205 7.59674 4.125 7 4.125C6.40326 4.125 5.83097 4.36205 5.40901 4.78401C4.98705 5.20597 4.75 5.77826 4.75 6.375C4.75 6.97174 4.98705 7.54403 5.40901 7.96599C5.83097 8.38795 6.40326 8.625 7 8.625Z"
                  fill="black"
                  fill-opacity="0.2"
                />
              </svg>
            </span>
            Location
          </h2>
          <span className={css.closeIcon} onClick={onCloseDropdown}>
            <IconCollection name="close_icon" />
          </span>
        </li>
        <li className={css.searchInputMobile}>{dropdownInput}</li>
        {predictions.map(item)}
        {/* <li
          className={classNames(css.menuItemMobile, css.footerWrapper)}
          style={{ paddingBottom: 0 }}
        >
          <div className={css.footer}>
            <button type="button" className={css.resetButton}>
              Reset All
            </button>
            <button type="button" className={css.showListingsButton} onClick={onNext}>
              Next
            </button>
          </div>
        </li> */}
      </ul>
      {children}
    </div>
  );
});

// Get the current value with defaults from the given
// LocationAutocompleteInput props.
const currentValue = props => {
  const value = props.input.value || {};
  const { search = '', predictions = [], selectedPlace = null } = value;
  return { search, predictions, selectedPlace };
};

class LocationAutocompleteInputImplementation extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    this.unsubscribe = null;
    this.unsubscribe2 = null;

    this.state = {
      inputHasFocus: false,
      selectionInProgress: false,
      touchStartedFrom: null,
      highlightedIndex: -1, // -1 means no highlight
      fetchingPlaceDetails: false,
      fetchingPredictions: false,
      dropdownOpen: false, // NEW: controls dropdown visibility
    };

    // Ref to the input element.
    this.input = null;
    this.shortQueryTimeout = null;
    this.dropdownRef = React.createRef(); // NEW: ref for dropdown

    this.getGeocoder = this.getGeocoder.bind(this);
    this.currentPredictions = this.currentPredictions.bind(this);
    this.changeHighlight = this.changeHighlight.bind(this);
    this.selectPrediction = this.selectPrediction.bind(this);
    this.selectItemIfNoneSelected = this.selectItemIfNoneSelected.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handlePredictionsSelectStart = this.handlePredictionsSelectStart.bind(this);
    this.handlePredictionsSelectMove = this.handlePredictionsSelectMove.bind(this);
    this.handlePredictionsSelectEnd = this.handlePredictionsSelectEnd.bind(this);
    this.finalizeSelection = this.finalizeSelection.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this); // NEW: bind
    this.handleReset = this.handleReset.bind(this);
    this.handleContainerClick = this.handleContainerClick.bind(this); // BIND NEW HANDLER

    // Debounce the method to avoid calling the API too many times
    // when the user is typing fast.
    this.predict = debounce(this.predict.bind(this), DEBOUNCE_WAIT_TIME, { leading: true });
  }

  componentDidMount() {
    this._isMounted = true;
    document.addEventListener('mousedown', this.handleClickOutside);
    document.addEventListener('touchstart', this.handleClickOutside);

    this.unsubscribe = EventBus.on('selectPrediction', this.selectPrediction);
    this.unsubscribe2 = EventBus.on('resetLocation', this.handleReset);
  }

  componentWillUnmount() {
    window.clearTimeout(this.shortQueryTimeout);
    this._isMounted = false;
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener('touchstart', this.handleClickOutside);

    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribe2) this.unsubscribe2();
  }

  handleClickOutside(event) {
    if (!this.state.dropdownOpen) return;
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target)) {
      this.setState({ dropdownOpen: false, inputHasFocus: false });
    }
  }

  // NEW: Open dropdown on mobile tap/click
  handleContainerClick(e) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile && !this.state.dropdownOpen) {
      this.setState({ dropdownOpen: true, inputHasFocus: true }, () => {
        if (this.input && typeof this.input.focus === 'function') {
          this.input.focus();
        }
      });
    }
  }

  getGeocoder() {
    const geocoderVariant = getGeocoderVariant(this.props.config.maps.mapProvider);
    const Geocoder = geocoderVariant.default;

    // Create the Geocoder as late as possible only when it is needed.
    if (!this._geocoder) {
      this._geocoder = new Geocoder();
    }
    return this._geocoder;
  }

  currentPredictions() {
    const { search, predictions: fetchedPredictions } = currentValue(this.props);
    const { useDefaultPredictions = true, config } = this.props;
    const hasFetchedPredictions = fetchedPredictions && fetchedPredictions.length > 0;
    const showDefaultPredictions = !search && !hasFetchedPredictions && useDefaultPredictions;
    const geocoderVariant = getGeocoderVariant(config.maps.mapProvider);

    // A list of default predictions that can be shown when the user
    // focuses on the autocomplete input without typing a search. This can
    // be used to reduce typing and Geocoding API calls for common
    // searches.
    const defaultPredictions = (config.maps.search.suggestCurrentLocation
      ? [{ id: geocoderVariant.CURRENT_LOCATION_ID, predictionPlace: {} }]
      : []
    ).concat(config.maps.search.defaults);

    return showDefaultPredictions ? defaultPredictions : fetchedPredictions;
  }

  // Interpret input key event
  onKeyDown(e) {
    if (e.keyCode === KEY_CODE_ARROW_UP) {
      // Prevent changing cursor position in input
      e.preventDefault();
      this.changeHighlight(DIRECTION_UP);
    } else if (e.keyCode === KEY_CODE_ARROW_DOWN) {
      // Prevent changing cursor position in input
      e.preventDefault();
      this.changeHighlight(DIRECTION_DOWN);
    } else if (e.keyCode === KEY_CODE_ENTER) {
      const { selectedPlace } = currentValue(this.props);

      if (!selectedPlace) {
        // Prevent form submit, try to select value instead.
        e.preventDefault();
        e.stopPropagation();
        this.selectItemIfNoneSelected();
        this.input?.blur();
      }
    } else if (e.keyCode === KEY_CODE_TAB) {
      this.selectItemIfNoneSelected();
      this.input?.blur();
    } else if (e.keyCode === KEY_CODE_ESC && this.input) {
      this.input.blur();
    }
  }

  handleReset() {
    this.props.input.onChange({
      search: '',
      predictions: [],
      selectedPlace: null,
    });
    this.setState({ highlightedIndex: -1 });

    // On mobile, keep the dropdown open and input focused
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.setState({ dropdownOpen: true, inputHasFocus: true });
    }
  }

  // Handle input text change, fetch predictions if the value isn't empty
  onChange(e) {
    const onChange = this.props.input.onChange;
    const predictions = this.currentPredictions();
    const newValue = e.target.value;

    // Clear the current values since the input content is changed
    onChange({
      search: newValue,
      predictions: newValue ? predictions : [],
      selectedPlace: null,
    });

    // Clear highlighted prediction since the input value changed and
    // results will change as well
    this.setState({ highlightedIndex: -1 });

    if (!newValue) {
      // No need to fetch predictions on empty input
      return;
    }

    if (newValue.length >= 3) {
      if (this.shortQueryTimeout) {
        window.clearTimeout(this.shortQueryTimeout);
      }
      this.predict(newValue);
    } else {
      this.shortQueryTimeout = window.setTimeout(() => {
        this.predict(newValue);
      }, DEBOUNCE_WAIT_TIME_FOR_SHORT_QUERIES);
    }
  }

  // Change the currently highlighted item by calculating the new
  // index from the current state and the given direction number
  // (DIRECTION_UP or DIRECTION_DOWN)
  changeHighlight(direction) {
    this.setState((prevState, props) => {
      const predictions = this.currentPredictions();
      const currentIndex = prevState.highlightedIndex;
      let index = currentIndex;

      if (direction === DIRECTION_UP) {
        // Keep the first position if already highlighted
        index = currentIndex === 0 ? 0 : currentIndex - 1;
      } else if (direction === DIRECTION_DOWN) {
        index = currentIndex + 1;
      }

      // Check that the index is within the bounds
      if (index < 0) {
        index = -1;
      } else if (index >= predictions.length) {
        index = predictions.length - 1;
      }

      return { highlightedIndex: index };
    });
  }

  // Select the prediction in the given item. This will fetch/read the
  // place details and set it as the selected place.
  async selectPrediction(p) {
    let prediction = p;

    if (typeof p === 'string') {
      const config = this.props.config;
      const r = await this.getGeocoder().getPlacePredictions(
        prediction,
        config.maps.search.countryLimit,
        config.localization.locale
      );

      prediction = r.predictions[0];
    }

    const currentLocationBoundsDistance = this.props.config.maps?.search
      ?.currentLocationBoundsDistance;
    this.props.input.onChange({
      ...this.props.input,
      selectedPlace: null,
      predictions: this.props.input.value?.predictions || [],
    });

    this.setState({ fetchingPlaceDetails: true });

    this.getGeocoder()
      .getPlaceDetails(prediction, currentLocationBoundsDistance)
      .then(place => {
        if (!this._isMounted) {
          // Ignore if component already unmounted
          return;
        }
        this.setState({ fetchingPlaceDetails: false });
        this.props.input.onChange({
          search: place.address,
          predictions: this.props.input.value?.predictions || [],
          selectedPlace: place,
        });
      })
      .catch(e => {
        this.setState({ fetchingPlaceDetails: false });
        // eslint-disable-next-line no-console
        console.error(e);
        this.props.input.onChange({
          ...this.props.input.value,
          selectedPlace: null,
        });
      });
  }
  selectItemIfNoneSelected() {
    if (this.state.fetchingPredictions) {
      // No need to select anything since prediction fetch is still going on
      return;
    }

    const { search, selectedPlace } = currentValue(this.props);
    const predictions = this.currentPredictions();
    if (!selectedPlace) {
      if (predictions && predictions.length > 0) {
        const index = this.state.highlightedIndex !== -1 ? this.state.highlightedIndex : 0;
        this.selectPrediction(predictions[index]);
      } else {
        this.predict(search);
      }
    }
  }
  predict(search) {
    const config = this.props.config;
    const onChange = this.props.input.onChange;
    this.setState({ fetchingPredictions: true });

    return this.getGeocoder()
      .getPlacePredictions(search, config.maps.search.countryLimit, config.localization.locale)
      .then(results => {
        const { search: currentSearch } = currentValue(this.props);
        this.setState({ fetchingPredictions: false });

        // If the earlier predictions arrive when the user has already
        // changed the search term, ignore and wait until the latest
        // predictions arrive. Without this logic, results for earlier
        // requests would override whatever the user had typed since.
        //
        // This is essentially the same as switchLatest in RxJS or
        // takeLatest in Redux Saga, without canceling the earlier
        // requests.
        if (results.search === currentSearch) {
          onChange({
            search: results.search,
            predictions: results.predictions,
            selectedPlace: null,
          });
        }
      })
      .catch(e => {
        this.setState({ fetchingPredictions: false });
        // eslint-disable-next-line no-console
        console.error(e);
        const value = currentValue(this.props);
        onChange({
          ...value,
          selectedPlace: null,
        });
      });
  }

  finalizeSelection() {
    // const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    // if (isMobile) {
    //   // On mobile, keep the dropdown open and input focused
    //   this.setState({ inputHasFocus: true, highlightedIndex: -1, dropdownOpen: true });
    // } else {
    //   // On desktop, close the dropdown
    // }
    this.setState({ inputHasFocus: false, highlightedIndex: -1, dropdownOpen: false });
    this.props.input.onBlur(currentValue(this.props));
  }

  handleOnBlur(e) {
    // If the new focus is still inside the dropdown parent, do not close
    if (
      this.dropdownRef &&
      this.dropdownRef.current &&
      e &&
      e.relatedTarget &&
      this.dropdownRef.current.contains(e.relatedTarget)
    ) {
      return;
    }
    if (this.props.closeOnBlur && !this.state.selectionInProgress) {
      this.finalizeSelection();
    }
  }

  handlePredictionsSelectStart(touchCoordinates) {
    this.setState({
      selectionInProgress: true,
      touchStartedFrom: touchCoordinates,
      isSwipe: false,
    });
  }

  handlePredictionsSelectMove(touchCoordinates) {
    this.setState(prevState => {
      const touchStartedFrom = prevState.touchStartedFrom;
      const isTouchAction = !!touchStartedFrom;
      const isSwipe = isTouchAction
        ? Math.abs(touchStartedFrom.y - touchCoordinates.y) > TOUCH_TAP_RADIUS
        : false;

      return { selectionInProgress: false, isSwipe };
    });
  }

  handlePredictionsSelectEnd(prediction) {
    let selectAndFinalize = false;
    this.setState(
      prevState => {
        if (!prevState.isSwipe) {
          selectAndFinalize = true;
        }
        return { selectionInProgress: false, touchStartedFrom: null, isSwipe: false };
      },
      () => {
        if (selectAndFinalize) {
          this.selectPrediction(prediction);
          this.finalizeSelection();
        }
      }
    );
  }

  render() {
    const {
      autoFocus,
      rootClassName,
      className,
      useDarkText,
      iconClassName,
      CustomIcon,
      inputClassName,
      predictionsClassName,
      predictionsAttributionClassName,
      validClassName,
      placeholder = '',
      input,
      meta,
      inputRef,
      disabled,
      config,
      Searchicon,
      showCrossIcon,
      onNext = () => {},
    } = this.props;
    const { name, onFocus } = input;
    const { search } = currentValue(this.props);
    const { touched, valid } = meta || {};
    const isValid = valid && touched;
    const predictions = this.currentPredictions();

    // Detect mobile view (simple check, can be improved)
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    const handleOnFocus = e => {
      this.setState({ inputHasFocus: true, dropdownOpen: true });
      if (typeof input.onFocus === 'function') {
        input.onFocus(e);
      }
    };

    const handleCloseDropdown = () => {
      this.setState({ dropdownOpen: false, inputHasFocus: false });
    };

    const rootClass = classNames(
      rootClassName || css.root,
      className,
      this.state.inputHasFocus && css.inputHasFocus
    );
    const iconClass = classNames(iconClassName || css.icon);
    const inputClass = classNames(inputClassName || css.input, { [validClassName]: isValid });
    const predictionsClass = classNames(predictionsClassName);

    // Only render predictions when the dropdown is open
    const renderPredictions = this.state.dropdownOpen;
    const geocoderVariant = getGeocoderVariant(config.maps.mapProvider);
    const GeocoderAttribution = geocoderVariant.GeocoderAttribution;
    // The first ref option in this optional chain is about callback ref,
    // which was used in previous version of this Template.
    const refMaybe =
      typeof inputRef === 'function'
        ? {
            ref: node => {
              this.input = node;
              if (inputRef) {
                inputRef(node);
              }
            },
          }
        : inputRef
        ? { ref: inputRef }
        : {};

    return (
      <div className={rootClass} ref={this.dropdownRef} onClick={this.handleContainerClick}>
        {/* <div className={iconClass}>
          {this.state.fetchingPlaceDetails ? (
            <IconSpinner className={css.iconSpinner} />
          ) : CustomIcon ? (
            <CustomIcon />
          ) : (
            <IconHourGlass />
          )}
        </div> */}
        <div>
          {Searchicon ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.875 1.81242C6.21018 1.81242 5.55188 1.94336 4.93766 2.19778C4.32345 2.45219 3.76537 2.82509 3.29527 3.29519C2.82518 3.76529 2.45227 4.32337 2.19786 4.93758C1.94345 5.55179 1.8125 6.2101 1.8125 6.87492C1.8125 7.53973 1.94345 8.19804 2.19786 8.81225C2.45227 9.42646 2.82518 9.98455 3.29527 10.4546C3.76537 10.9247 4.32345 11.2976 4.93766 11.5521C5.55188 11.8065 6.21018 11.9374 6.875 11.9374C8.21766 11.9374 9.50533 11.404 10.4547 10.4546C11.4041 9.50524 11.9375 8.21758 11.9375 6.87492C11.9375 5.53226 11.4041 4.24459 10.4547 3.29519C9.50533 2.34579 8.21766 1.81242 6.875 1.81242ZM0.6875 6.87492C0.687631 5.88124 0.92708 4.90221 1.38559 4.02064C1.8441 3.13907 2.50819 2.3809 3.32168 1.81026C4.13516 1.23961 5.07412 0.873285 6.05912 0.74226C7.04412 0.611235 8.04619 0.719366 8.98057 1.05751C9.91494 1.39565 10.7541 1.95386 11.4272 2.68491C12.1002 3.41596 12.5872 4.29835 12.8471 5.25744C13.107 6.21653 13.1321 7.2241 12.9202 8.19493C12.7084 9.16576 12.2658 10.0713 11.63 10.8349L15.1475 14.3524C15.2028 14.4039 15.2471 14.466 15.2778 14.535C15.3086 14.604 15.3251 14.6785 15.3264 14.754C15.3278 14.8296 15.3139 14.9046 15.2856 14.9746C15.2573 15.0447 15.2152 15.1083 15.1618 15.1617C15.1084 15.2151 15.0447 15.2572 14.9747 15.2855C14.9047 15.3138 14.8296 15.3277 14.7541 15.3264C14.6786 15.325 14.6041 15.3085 14.5351 15.2778C14.4661 15.247 14.404 15.2027 14.3525 15.1474L10.835 11.6299C9.93142 12.3825 8.83207 12.8621 7.66574 13.0124C6.49942 13.1626 5.31441 12.9775 4.24956 12.4785C3.1847 11.9795 2.28409 11.1874 1.65322 10.195C1.02236 9.20254 0.687371 8.05089 0.6875 6.87492Z"
                fill="#F74DF4"
              />
            </svg>
          ) : (
            <svg
              width="18"
              height="21"
              viewBox="0 0 18 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.54 20.351L8.61 20.391L8.638 20.407C8.74903 20.467 8.87327 20.4985 8.9995 20.4985C9.12573 20.4985 9.24997 20.467 9.361 20.407L9.389 20.392L9.46 20.351C9.85112 20.1191 10.2328 19.8716 10.604 19.609C11.5651 18.9305 12.463 18.1667 13.287 17.327C15.231 15.337 17.25 12.347 17.25 8.5C17.25 6.31196 16.3808 4.21354 14.8336 2.66637C13.2865 1.11919 11.188 0.25 9 0.25C6.81196 0.25 4.71354 1.11919 3.16637 2.66637C1.61919 4.21354 0.75 6.31196 0.75 8.5C0.75 12.346 2.77 15.337 4.713 17.327C5.53664 18.1667 6.43427 18.9304 7.395 19.609C7.76657 19.8716 8.14854 20.1191 8.54 20.351ZM9 11.5C9.79565 11.5 10.5587 11.1839 11.1213 10.6213C11.6839 10.0587 12 9.29565 12 8.5C12 7.70435 11.6839 6.94129 11.1213 6.37868C10.5587 5.81607 9.79565 5.5 9 5.5C8.20435 5.5 7.44129 5.81607 6.87868 6.37868C6.31607 6.94129 6 7.70435 6 8.5C6 9.29565 6.31607 10.0587 6.87868 10.6213C7.44129 11.1839 8.20435 11.5 9 11.5Z"
                fill="#231F20"
              />
            </svg>
          )}
        </div>
        <div className={css.inputContainer}>
          <label className={css.label}>{this.props.intl.formatMessage({ id: 'PageBuilder.SearchCTA.location' })}</label>
          {isMobile ? (
            <span
              className={classNames(
                css.locationInput,
                search ? css.hasValue : css.plceholder,
                placeholder == 'Current location' && css.hasValue
              )}
            >
              {search ? search : placeholder}
            </span>
          ) : (
            <input
              className={inputClass}
              type="search"
              autoComplete="off"
              autoFocus={autoFocus}
              placeholder={placeholder}
              name={name}
              value={search}
              disabled={disabled || this.state.fetchingPlaceDetails}
              onFocus={handleOnFocus}
              // onBlur={this.handleOnBlur}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              {...refMaybe}
              title={search}
              data-testid="location-search"
            />
          )}
          {this.state.inputHasFocus && showCrossIcon && (
            <div onClick={this.handleReset} className={css.crossIcon}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 10.5L10.5 1.5M1.5 1.5L10.5 10.5"
                  stroke="#231F20"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {renderPredictions ? (
          <LocationPredictionsList
            rootClassName={predictionsClass}
            useDarkText={useDarkText}
            predictions={predictions}
            currentLocationId={geocoderVariant.CURRENT_LOCATION_ID}
            isGoogleMapsInUse={config.maps.mapProvider === 'googleMaps'}
            geocoder={this.getGeocoder()}
            highlightedIndex={this.state.highlightedIndex}
            onSelectStart={this.handlePredictionsSelectStart}
            onSelectMove={this.handlePredictionsSelectMove}
            onSelectEnd={this.handlePredictionsSelectEnd}
            dropdownInput={
              <>
                <input
                  className={inputClass}
                  type="search"
                  autoComplete="off"
                  autoFocus={autoFocus}
                  placeholder={placeholder}
                  name={name}
                  value={search}
                  disabled={disabled || this.state.fetchingPlaceDetails}
                  onFocus={handleOnFocus}
                  // onBlur={this.handleOnBlur}
                  onChange={this.onChange}
                  onKeyDown={this.onKeyDown}
                  {...refMaybe}
                  title={search}
                  data-testid="location-search"
                />

                {this.state.inputHasFocus && showCrossIcon && (
                  <div onClick={this.handleReset} className={css.crossIcon}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.5 10.5L10.5 1.5M1.5 1.5L10.5 10.5"
                        stroke="#231F20"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </>
            }
            onCloseDropdown={handleCloseDropdown}
            isMobile={isMobile}
            onClearInput={this.handleReset}
            onNext={onNext}
          >
            <GeocoderAttribution
              className={predictionsAttributionClassName}
              useDarkText={useDarkText}
            />
          </LocationPredictionsList>
        ) : null}
      </div>
    );
  }
}

/**
 * @typedef {Object} SearchData
 * @property {string} search
 * @property {Object} predictions
 * @property {Object} selectedPlace
 */

/**
 * @typedef {Object} SearchData
 * @property {Object} current
 */

/**
 * Location auto completion input component
 *
 * This component can work as the `component` prop to Final Form's
 * <Field /> component. It takes a custom input value shape, and
 * controls the onChange callback that is called with the input value.
 *
 * The component works by listening to the underlying input component
 * and calling a Geocoder implementation for predictions. When the
 * predictions arrive, those are passed to Final Form in the onChange
 * callback.
 *
 * See the LocationAutocompleteInput.example.js file for a usage
 * example within a form.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string?} props.iconClassName
 * @param {string?} props.inputClassName
 * @param {string?} props.predictionsClassName
 * @param {string?} props.predictionsAttributionClassName
 * @param {string?} props.validClassName
 * @param {boolean} props.autoFocus
 * @param {boolean} props.closeOnBlur
 * @param {string?} props.placeholder
 * @param {boolean} props.useDefaultPredictions
 * @param {Object} props.input
 * @param {string} props.input.name
 * @param {string|SearchData} props.input.value
 * @param {Function} props.input.onChange
 * @param {Function} props.input.onFocus
 * @param {Function} props.input.onBlur
 * @param {Object} props.meta
 * @param {boolean} props.meta.valid
 * @param {boolean} props.meta.touched
 * @param {Function | RefHook} props.inputRef
 * @param {ReactNode} props.CustomIcon override the default icon
 * @returns {JSX.Element} LocationAutocompleteInputImpl component
 */
const LocationAutocompleteInputImpl = props => {
  const config = useConfiguration();
  const intl = useIntl();

  return <LocationAutocompleteInputImplementation config={config} intl={intl} {...props} />;
};

export default LocationAutocompleteInputImpl;
