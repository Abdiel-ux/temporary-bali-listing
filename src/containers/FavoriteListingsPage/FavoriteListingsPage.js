import React, { useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { FormattedMessage, injectIntl } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { FaTrash } from "react-icons/fa";
import { checkIsProvider } from '../../util/userHelpers';

import { unfavoriteListing, unfavoriteAllListings } from './FavoriteListingsPage.duck';

import {
  H3,
  Page,
  PaginationLinks,
  UserNav,
  // LayoutSingleColumn,
} from '../../components';
import LayoutSingleColumn from '../../components/LayoutComposer/LayoutSingleColumn/LayoutSingleColumn';

import ListingCard from '../../components/ListingCard/ListingCard';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

import css from './FavoriteListingsPage.module.css';

export const FavoriteListingsPageComponent = props => {
  const {
    listings,
    pagination,
    queryInProgress,
    queryFavoritesError,
    queryParams,
    scrollingDisabled,
    intl,
    dispatch,
    currentUser,
  } = props;

  if (currentUser && checkIsProvider(currentUser)) {
    return <NotFoundPage staticContext={props.staticContext} />;
  }

  const [selectedIds, setSelectedIds] = useState([]);

  const hasPaginationInfo = !!pagination && pagination.totalItems != null;
  const listingsAreLoaded = !queryInProgress && hasPaginationInfo;

  const loadingResults = (
    <div className={css.messagePanel}>
      <H3 as="h2" className={css.heading}></H3>
    </div>
  );

  const queryError = (
    <div className={css.messagePanel}>
      <H3 as="h2" className={css.heading}>
        <FormattedMessage id="Favorite Listings Error" />
      </H3>
    </div>
  );

  const noResults =
    listingsAreLoaded && listings.length === 0 ? (
      <div className={css.messagePanel}>
        <H3 as="h1" className={css.heading}>
          <FormattedMessage id="Favorite Listings Results" />
        </H3>
      </div>
    ) : null;

  // Unfavorite All handler
  const handleUnfavoriteAll = async () => {
    if (!dispatch) return;

    const confirmed = window.confirm(
      intl.formatMessage({ id: 'FavoriteListingsPage.unfavoritAllConfirmation' }) ||
        'Remove ALL favorites from your profile? This cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await dispatch(unfavoriteAllListings());
      setSelectedIds([]);
    } catch (e) {
      console.error('Unfavorite all failed', e);
    }
  };

  const heading =
    listingsAreLoaded && listings.length > 0 ? (
      <H3 as="h1" className={css.heading}>
        <FormattedMessage id="Favorite Listings" />
      </H3>
    ) : null;

  const page = queryParams?.page || 1;
  const paginationLinks =
    listingsAreLoaded && pagination && pagination.totalPages > 1 ? (
      <PaginationLinks
        className={css.pagination}
        pageName="FavoriteListingsPage"
        pageSearchParams={{ page }}
        pagination={pagination}
      />
    ) : null;

  const title = intl.formatMessage({ id: 'Favorite Listings' });

  const panelWidth = 62.5;
  const renderSizes = [
    `(max-width: 767px) 100vw`,
    `(max-width: 1920px) ${panelWidth / 2}vw`,
    `${panelWidth / 3}vw`,
  ].join(', ');

  const toggleSelect = id => {
    setSelectedIds(selectedIds =>
      selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]
    );
  };

  const handleUnfavoriteSelected = async () => {
    if (dispatch && selectedIds.length > 0) {
      for (const id of selectedIds) {
        await dispatch(unfavoriteListing(id));
      }

      setSelectedIds([]);
    }
  };

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer currentPage="FavoriteListingsPage" />
            <UserNav currentPage="FavoriteListingsPage" />
          </>
        }
        footer={<FooterContainer />}
      >
        <div className={css.listingPanel}>
          {heading}
          {queryInProgress && loadingResults}

          {/* Show error state */}
          {queryFavoritesError && queryError}

          {/* Show content when not loading and no error */}
          {!queryInProgress && !queryFavoritesError && (
            <>
              {/* Button Group - Tetap muncul meski tidak ada yang terpilih */}
              <div className={css.buttonGroup}>
                {/* Tombol Unfavorite Selected - hanya muncul jika ada yang terpilih */}
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleUnfavoriteSelected}
                    className={css.removeSelected}
                    title={intl.formatMessage({ id: 'FavoriteListingsPage.unfavoriteSelected' })}
                  >
                    <FaTrash className={css.removeIcon} />
                  </button>
                )}
                
                {/* Tombol Unfavorite All - selalu muncul jika ada listings */}
                {listings.length > 0 && (
                  <button
                    onClick={handleUnfavoriteAll}
                    className={css.removeAll}
                    title={intl.formatMessage({ id: 'FavoriteListingsPage.unfavoriteAll' })}
                  >
                      <FormattedMessage id="Unfavorite All" />
                  </button>
                )}
              </div>

              {/* Listings grid */}
              <div className={css.listingCards}>
                {listings.length > 0
                  ? listings.map(listing => {
                      // Handle both object and string IDs
                      const id = listing.id?.uuid || listing.id;
                      const isSelected = selectedIds.includes(id);

                      return (
                        <div className={css.listingCard} key={id}>
                          <div
                            className={`${css.selectCircle} ${isSelected ? css.selected : ''}`}
                            onClick={() => toggleSelect(id)}
                            title={
                              isSelected
                                ? intl.formatMessage({ id: 'FavoriteListingsPage.deselect' })
                                : intl.formatMessage({ id: 'FavoriteListingsPage.select' })
                            }
                          />
                          <ListingCard
                            listing={listing}
                            renderSizes={renderSizes}
                            showWishlistButton={false}
                          />
                        </div>
                      );
                    })
                  : !queryInProgress &&
                    !queryFavoritesError && (
                      <div className={css.emptyPanel}>
                        <FormattedMessage id="FavoriteListingsPage.noResults" />
                      </div>
                    )}
              </div>

              {paginationLinks}
            </>
          )}
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => {
  const {
    currentPageResultIds = [],
    pagination,
    queryInProgress = false,
    queryFavoritesError = null,
    queryParams = null,
    listings = [],
  } = state.FavoriteListingsPage || {};

  return {
    currentPageResultIds,
    listings,
    pagination,
    queryInProgress,
    queryFavoritesError,
    queryParams,
    scrollingDisabled: isScrollingDisabled(state),
    currentUser: state.user?.currentUser || null,
  };
};

const FavoriteListingsPage = compose(
  connect(mapStateToProps),
  injectIntl
)(FavoriteListingsPageComponent);

export default FavoriteListingsPage;