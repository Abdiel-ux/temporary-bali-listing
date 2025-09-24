import React, { Component } from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { createResourceLocatorString } from '../../../util/routes';
import { getSearchPageResourceLocatorStringParams } from '../SearchPage.shared';

import { ModalInMobile, Button } from '../../../components';

import PopupOpenerButton from '../PopupOpenerButton/PopupOpenerButton';
import css from './SearchFiltersMobile.module.css';

class SearchFiltersMobileComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { isFiltersOpenOnMobile: false, initialQueryParams: null };

    this.openFilters = this.openFilters.bind(this);
    this.cancelFilters = this.cancelFilters.bind(this);
    this.closeFilters = this.closeFilters.bind(this);
    this.resetAll = this.resetAll.bind(this);
  }

  // Open filters modal, set the initial parameters to current ones
  openFilters() {
    const { onOpenModal, urlQueryParams } = this.props;
    onOpenModal();
    this.setState({ isFiltersOpenOnMobile: true, initialQueryParams: urlQueryParams });
  }

  // Close the filters by clicking cancel, revert to the initial params
  cancelFilters() {
    const { history, onCloseModal, location, routeConfiguration } = this.props;

    const { routeName, pathParams } = getSearchPageResourceLocatorStringParams(
      routeConfiguration,
      location
    );

    history.push(
      createResourceLocatorString(
        routeName,
        routeConfiguration,
        pathParams,
        this.state.initialQueryParams
      )
    );
    onCloseModal();
    this.setState({ isFiltersOpenOnMobile: false, initialQueryParams: null });
  }

  // Close the filter modal
  closeFilters() {
    this.props.onCloseModal();
    this.setState({ isFiltersOpenOnMobile: false });
  }

  // Reset all filter query parameters
  resetAll(e) {
    this.props.resetAll(e);

    // blur event target if event is passed
    if (e && e.currentTarget) {
      e.currentTarget.blur();
    }
  }

  render() {
    const {
      rootClassName,
      className,
      children,
      sortByComponent,
      listingsAreLoaded,
      resultsCount,
      searchInProgress = false,
      showAsModalMaxWidth,
      onMapIconClick = () => { },
      onManageDisableScrolling,
      selectedFiltersCount = 0,
      noResultsInfo,
      intl,
      isMapVariant = true,
      openCustomFilters,
      isMapOpen,
      onMapClose,
    } = this.props;

    const classes = classNames(rootClassName || css.root, className, {
      [css.isMapOpen]: isMapOpen,
    });

    const resultsFound = (
      <FormattedMessage id="SearchFiltersMobile.foundResults" values={{ count: resultsCount }} />
    );
    const noResults = <FormattedMessage id="SearchFiltersMobile.noResults" />;
    const loadingResults = <FormattedMessage id="SearchFiltersMobile.loadingResults" />;
    const filtersHeading = intl.formatMessage({ id: 'SearchFiltersMobile.heading' });
    const modalCloseButtonMessage = intl.formatMessage({ id: 'SearchFiltersMobile.cancel' });

    const showListingsLabel = intl.formatMessage(
      { id: 'SearchFiltersMobile.showListings' },
      { count: resultsCount }
    );

    return (
      <div className={classes}>
        <div className={css.searchResultSummary}>
          <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.9542 7.77191L16.6384 2.21605C16.5989 1.49228 16.0067 0.900114 15.283 0.860629L9.74027 0.557975C9.33101 0.543502 8.93623 0.675095 8.64672 0.964609L0.785345 8.82598C0.219504 9.39182 0.220814 10.288 0.786663 10.8538L6.64519 16.7124C7.21104 17.2782 8.10719 17.2795 8.67303 16.7137L16.5344 8.85229C16.8239 8.56278 16.9687 8.18116 16.9542 7.77191ZM14.0184 3.49382C14.5316 4.00703 14.5316 4.84923 14.0184 5.36244C13.5051 5.87566 12.6616 5.87697 12.1484 5.36375C11.6352 4.85054 11.6365 4.00703 12.1497 3.49382C12.6761 2.96745 13.5051 2.98061 14.0184 3.49382Z" fill="#F74DF4" />
          </svg>

          {listingsAreLoaded && resultsCount > 0 ? resultsFound : null}
          {listingsAreLoaded && resultsCount === 0 ? noResults : null}
          {searchInProgress ? loadingResults : null}
        </div>
        <div className={css.buttons}>
          <PopupOpenerButton isSelected={selectedFiltersCount > 0} toggleOpen={openCustomFilters} onClick={openCustomFilters}>
            <span className={css.filterIcon}>
              <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.60156 2.50391H13.9141M6.60156 2.50391C6.60156 2.80227 6.48304 3.08842 6.27206 3.2994C6.06108 3.51038 5.77493 3.62891 5.47656 3.62891C5.17819 3.62891 4.89205 3.51038 4.68107 3.2994C4.47009 3.08842 4.35156 2.80227 4.35156 2.50391M6.60156 2.50391C6.60156 2.20554 6.48304 1.91939 6.27206 1.70841C6.06108 1.49743 5.77493 1.37891 5.47656 1.37891C5.17819 1.37891 4.89205 1.49743 4.68107 1.70841C4.47009 1.91939 4.35156 2.20554 4.35156 2.50391M4.35156 2.50391H1.53906M6.60156 11.5039H13.9141M6.60156 11.5039C6.60156 11.8023 6.48304 12.0884 6.27206 12.2994C6.06108 12.5104 5.77493 12.6289 5.47656 12.6289C5.17819 12.6289 4.89205 12.5104 4.68107 12.2994C4.47009 12.0884 4.35156 11.8023 4.35156 11.5039M6.60156 11.5039C6.60156 11.2055 6.48304 10.9194 6.27206 10.7084C6.06108 10.4974 5.77493 10.3789 5.47656 10.3789C5.17819 10.3789 4.89205 10.4974 4.68107 10.7084C4.47009 10.9194 4.35156 11.2055 4.35156 11.5039M4.35156 11.5039H1.53906M11.1016 7.00391H13.9141M11.1016 7.00391C11.1016 7.30227 10.983 7.58842 10.7721 7.7994C10.5611 8.01038 10.2749 8.12891 9.97656 8.12891C9.67819 8.12891 9.39205 8.01038 9.18107 7.7994C8.97009 7.58842 8.85156 7.30227 8.85156 7.00391M11.1016 7.00391C11.1016 6.70554 10.983 6.41939 10.7721 6.20841C10.5611 5.99743 10.2749 5.87891 9.97656 5.87891C9.67819 5.87891 9.39205 5.99743 9.18107 6.20841C8.97009 6.41939 8.85156 6.70554 8.85156 7.00391M8.85156 7.00391H1.53906" stroke="#F74DF4" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round" />
              </svg>

            </span>
            <FormattedMessage
              id="SearchFiltersMobile.filtersButtonLabel"
              className={css.mapIconText}
            />
          </PopupOpenerButton>

          {sortByComponent}
          {isMapVariant ? (
            <div className={css.mapIcon} onClick={isMapOpen ? onMapClose : onMapIconClick}>
              <span className={css.filterIcon}>
                {isMapOpen ? <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.02344 9.00391H7.83594M5.02344 11.2539H7.83594M5.02344 13.5039H7.83594M10.0859 14.0664H11.7734C12.221 14.0664 12.6502 13.8886 12.9667 13.5721C13.2831 13.2557 13.4609 12.8265 13.4609 12.3789V4.58491C13.4609 3.73366 12.8272 3.01141 11.9789 2.94091C11.6984 2.91764 11.4177 2.89764 11.1367 2.88091M11.1367 2.88091C11.1865 3.04222 11.211 3.21009 11.2109 3.37891C11.2109 3.52809 11.1517 3.67116 11.0462 3.77665C10.9407 3.88214 10.7976 3.94141 10.6484 3.94141H7.27344C6.96294 3.94141 6.71094 3.68941 6.71094 3.37891C6.71094 3.20566 6.73719 3.03841 6.78594 2.88091M11.1367 2.88091C10.9244 2.19241 10.2824 1.69141 9.52344 1.69141H8.39844C8.03787 1.69149 7.6868 1.80701 7.39663 2.02106C7.10647 2.23511 6.89246 2.53643 6.78594 2.88091M6.78594 2.88091C6.50394 2.89816 6.22344 2.91841 5.94294 2.94091C5.09469 3.01141 4.46094 3.73366 4.46094 4.58491V6.19141M4.46094 6.19141H1.92969C1.46394 6.19141 1.08594 6.56941 1.08594 7.03516V15.4727C1.08594 15.9384 1.46394 16.3164 1.92969 16.3164H9.24219C9.70794 16.3164 10.0859 15.9384 10.0859 15.4727V7.03516C10.0859 6.56941 9.70794 6.19141 9.24219 6.19141H4.46094ZM3.33594 9.00391H3.34194V9.00991H3.33594V9.00391ZM3.33594 11.2539H3.34194V11.2599H3.33594V11.2539ZM3.33594 13.5039H3.34194V13.5099H3.33594V13.5039Z" stroke="#F74DF4" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round" />
                </svg>
                  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.02344 4.06605V10.2535M10.5234 5.75355V11.941M10.9007 14.5645L14.5569 12.7368C14.8427 12.5943 15.0234 12.3018 15.0234 11.9823V2.61855C15.0234 1.99155 14.3634 1.58355 13.8024 1.86405L10.9007 3.31455C10.6629 3.4338 10.3832 3.4338 10.1462 3.31455L6.40069 1.44255C6.28355 1.384 6.15439 1.35352 6.02344 1.35352C5.89248 1.35352 5.76332 1.384 5.64619 1.44255L1.98994 3.2703C1.70344 3.41355 1.52344 3.70605 1.52344 4.0248V13.3886C1.52344 14.0156 2.18344 14.4236 2.74444 14.1431L5.64619 12.6925C5.88394 12.5733 6.16369 12.5733 6.40069 12.6925L10.1462 14.5653C10.3839 14.6838 10.6637 14.6838 10.9007 14.5653V14.5645Z" stroke="#F74DF4" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round" />
                  </svg>}

              </span>
              {isMapOpen ? 'List' : <FormattedMessage id="SearchFiltersMobile.openMapView" className={css.mapIconText} />}
            </div>
          ) : null}
        </div>

        {noResultsInfo ? noResultsInfo : null}

        <ModalInMobile
          id="SearchFiltersMobile.filters"
          isModalOpenOnMobile={this.state.isFiltersOpenOnMobile}
          onClose={this.cancelFilters}
          showAsModalMaxWidth={showAsModalMaxWidth}
          onManageDisableScrolling={onManageDisableScrolling}
          containerClassName={css.modalContainer}
          closeButtonMessage={modalCloseButtonMessage}
        >
          <div className={css.modalHeadingWrapper}>
            <span className={css.modalHeading}>{filtersHeading}</span>
            <button className={css.resetAllButton} onClick={e => this.resetAll(e)}>
              <FormattedMessage id={'SearchFiltersMobile.resetAll'} />
            </button>
          </div>
          {this.state.isFiltersOpenOnMobile ? (
            <div className={css.filtersWrapper}>{children}</div>
          ) : null}

          <div className={css.showListingsContainer}>
            <Button className={css.showListingsButton} onClick={this.closeFilters}>
              {showListingsLabel}
            </Button>
          </div>
        </ModalInMobile>
      </div>
    );
  }
}

/**
 * SearchFiltersMobile component
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {Object} props.urlQueryParams - The URL query params
 * @param {React.Node} props.sortByComponent - The sort by component
 * @param {boolean} props.listingsAreLoaded - Whether the listings are loaded
 * @param {number} props.resultsCount - The number of results
 * @param {boolean} props.searchInProgress - Whether the search is in progress
 * @param {number} props.showAsModalMaxWidth - The maximum width of the modal
 * @param {Function} props.onMapIconClick - The function to click the map icon
 * @param {Function} props.onManageDisableScrolling - The function to manage disable scrolling
 * @param {Function} props.onOpenModal - The function to open the modal
 * @param {Function} props.onCloseModal - The function to close the modal
 * @param {Function} props.resetAll - The function to reset all
 * @param {number} props.selectedFiltersCount - The number of selected filters
 * @param {boolean} props.isMapVariant - Whether the map variant is enabled
 * @returns {JSX.Element}
 */
const SearchFiltersMobile = props => {
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const history = useHistory();

  return (
    <SearchFiltersMobileComponent
      routeConfiguration={routeConfiguration}
      intl={intl}
      history={history}
      {...props}
    />
  );
};

export default SearchFiltersMobile;
