import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { ACCOUNT_SETTINGS_PAGES } from '../../routing/routeConfiguration';
import { LinkTabNavHorizontal } from '../../components';
import { selectIsProvider, selectCurrentUser } from '../../ducks/user.duck';

import css from './UserNav.module.css';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.rootClassName]
 * @param {string} props.currentPage
 * @param {boolean} [props.showManageListingsLink]
 * @param {boolean} [props.showFavoriteListingPage]
 * @param {boolean} [props.isProvider]
 */
const UserNav = props => {
  const {
    className,
    rootClassName,
    currentPage,
    showManageListingsLink = false,
    showFavoriteListingPage = true,
    isProvider = false,
  } = props;

  const classes = classNames(rootClassName || css.root, className);

  const manageListingsTabMaybe = showManageListingsLink
    ? [
        {
          text: <FormattedMessage id="UserNav.yourListings" />,
          selected: currentPage === 'ManageListingsPage',
          linkProps: {
            name: 'ManageListingsPage',
          },
        },
      ]
    : [];

  const favoriteTabMaybe = showFavoriteListingPage && !isProvider
    ? [
        {
          text: <FormattedMessage id="Favorite Listings" />,
          selected: currentPage === 'FavoriteListingsPage',
          disabled: false,
          linkProps: {
            name: 'FavoriteListingsPage',
          },
        },
      ]
    : [];

  const tabs = [
    ...manageListingsTabMaybe,
    ...favoriteTabMaybe,
    {
      text: <FormattedMessage id="UserNav.profileSettings" />,
      selected: currentPage === 'ProfileSettingsPage',
      disabled: false,
      linkProps: {
        name: 'ProfileSettingsPage',
      },
    },
    {
      text: <FormattedMessage id="UserNav.accountSettings" />,
      selected: ACCOUNT_SETTINGS_PAGES.includes(currentPage),
      disabled: false,
      linkProps: {
        name: 'ContactDetailsPage',
      },
    },
  ];

  return (
    <LinkTabNavHorizontal
      className={classes}
      tabRootClassName={css.tab}
      tabs={tabs}
      skin="dark"
    />
  );
};

/**
 * Gunakan selector central (selectIsProvider) agar deteksi provider konsisten
 * dengan logic di user.duck.js
 */

const mapStateToProps = state => ({
  isProvider: selectIsProvider(state),
});



export default connect(mapStateToProps)(UserNav);
