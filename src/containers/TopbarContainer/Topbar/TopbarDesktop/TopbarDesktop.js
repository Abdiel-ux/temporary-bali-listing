import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { parse } from '../../../../util/urlHelpers';
import { FormattedMessage } from '../../../../util/reactIntl';
import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { checkIsProvider, checkIsCustomer } from '../../../../util/userHelpers';


import {
  Avatar,
  InlineTextButton,
  LinkedLogo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
  Button,
} from '../../../../components';

import IconCollection from '../../../../components/IconCollection/IconCollection';

import TopbarSearchForm from '../TopbarSearchForm/TopbarSearchForm';
import CustomLinksMenu from './CustomLinksMenu/CustomLinksMenu';
import LanguageCurrencyMenu from './LanguageCurrencyMenu/LanguageCurrencyMenu.js';

import css from './TopbarDesktop.module.css';

const SignupLink = () => {
  return (
    <NamedLink name="SignupPage" className={css.topbarLink}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );
};

const LoginLink = () => {
  return (
    <NamedLink name="LoginPage" className={css.topbarLink}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );
};

const InboxLink = ({ notificationCount, inboxTab }) => {
  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;
  return (
    <NamedLink className={css.topbarLink} name="InboxPage" params={{ tab: inboxTab }}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.inbox" />
        {notificationDot}
      </span>
    </NamedLink>
  );
};

const ProfileMenu = ({ currentPage, currentUser, onLogout, showManageListingsLink }) => {
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  return (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <Avatar className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        {/* Hanya tampilkan ManageListings untuk provider */}
        {showManageListingsLink ? (
          <MenuItem key="ManageListingsPage">
            <NamedLink
              className={classNames(css.menuLink, currentPageClass('ManageListingsPage'))}
              name="ManageListingsPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.yourListingsLink" />
            </NamedLink>
          </MenuItem>
        ) : null}

        <MenuItem key="ProfileSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem>

        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>

        {checkIsCustomer(currentUser) && (
          <MenuItem key="FavoriteListingsPage">
            <NamedLink
              className={classNames(css.menuLink, currentPageClass('FavoriteListingsPage'))}
              name="FavoriteListingsPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="Favorite Listings" />
            </NamedLink>
          </MenuItem>
        )}

        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

const NotSignedInProfileMenu = ({
  currentPage,
  customLinks,
  intl,
  authenticatedOnClientSide,
  isAuthenticatedOrJustHydrated,
  scrollToBottom,
}) => {
  return (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <div className={css.profileMenuIcon}>
         {currentPage == "search" ? <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="44" height="44" rx="22" fill="#F74DF4"/>
<path d="M27.9825 28.725C27.2838 27.7999 26.3798 27.0496 25.3417 26.5334C24.3036 26.0171 23.1599 25.749 22.0005 25.75C20.8411 25.749 19.6974 26.0171 18.6593 26.5334C17.6213 27.0496 16.7172 27.7999 16.0185 28.725M27.9825 28.725C29.346 27.5122 30.3076 25.9136 30.7417 24.1411C31.1758 22.3686 31.0608 20.5061 30.412 18.8005C29.7632 17.0949 28.6112 15.6268 27.1089 14.5909C25.6066 13.555 23.8248 13.0003 22 13.0003C20.1752 13.0003 18.3934 13.555 16.8911 14.5909C15.3888 15.6268 14.2368 17.0949 13.588 18.8005C12.9392 20.5061 12.8243 22.3686 13.2583 24.1411C13.6924 25.9136 14.655 27.5122 16.0185 28.725M27.9825 28.725C26.3365 30.1932 24.2061 31.0032 22.0005 31C19.7945 31.0034 17.6647 30.1934 16.0185 28.725M25.0005 19.75C25.0005 20.5457 24.6844 21.3087 24.1218 21.8713C23.5592 22.4339 22.7962 22.75 22.0005 22.75C21.2049 22.75 20.4418 22.4339 19.8792 21.8713C19.3166 21.3087 19.0005 20.5457 19.0005 19.75C19.0005 18.9544 19.3166 18.1913 19.8792 17.6287C20.4418 17.0661 21.2049 16.75 22.0005 16.75C22.7962 16.75 23.5592 17.0661 24.1218 17.6287C24.6844 18.1913 25 18.9544 25 19.75Z" stroke="white" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round"/>
</svg>
:<svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="44" height="44" rx="22" fill="white" fill-opacity="0.3" />
            <path
              d="M27.982 28.725C27.2833 27.7999 26.3793 27.0496 25.3412 26.5334C24.3031 26.0171 23.1594 25.7489 22 25.75C20.8407 25.7489 19.6969 26.0171 18.6588 26.5334C17.6208 27.0496 16.7168 27.7999 16.018 28.725M27.982 28.725C29.3455 27.5122 30.3071 25.9136 30.7412 24.1411C31.1753 22.3686 31.0603 20.5061 30.4115 18.8005C29.7627 17.0949 28.6107 15.6268 27.1084 14.5909C25.6061 13.555 23.8244 13.0003 21.9995 13.0003C20.1747 13.0003 18.3929 13.555 16.8906 14.5909C15.3883 15.6268 14.2363 17.0949 13.5875 18.8005C12.9388 20.5061 12.8238 22.3686 13.2578 24.1411C13.6919 25.9136 14.6545 27.5122 16.018 28.725M27.982 28.725C26.336 30.1932 24.2056 31.0031 22 31C19.794 31.0034 17.6642 30.1934 16.018 28.725M25 19.75C25 20.5456 24.6839 21.3087 24.1213 21.8713C23.5587 22.4339 22.7957 22.75 22 22.75C21.2044 22.75 20.4413 22.4339 19.8787 21.8713C19.3161 21.3087 19 20.5456 19 19.75C19 18.9543 19.3161 18.1913 19.8787 17.6287C20.4413 17.0661 21.2044 16.75 22 16.75C22.7957 16.75 23.5587 17.0661 24.1213 17.6287C24.6839 18.1913 25 18.9543 25 19.75Z"
              stroke="#231F20"
              stroke-width="1.5"
              stroke-linecap="round"
              strokeLinejoin="round"
            />
          </svg>}
        </div>
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="createListing">
          <div className={classNames(css.customLinksMenuWrapper, css.menuLink)}>
            <CustomLinksMenu
              currentPage={currentPage}
              customLinks={customLinks}
              intl={intl}
              hasClientSideContentReady={
                authenticatedOnClientSide || !isAuthenticatedOrJustHydrated
              }
            />
          </div>
        </MenuItem>
        <MenuItem key="login">
          <NamedLink className={classNames(css.menuLink, css.loginLink)} name="LoginPage">
            <FormattedMessage id="TopbarDesktop.login" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="signup">
          <NamedLink className={classNames(css.menuLink, css.signupLink)} name="SignupPage">
            <FormattedMessage id="TopbarDesktop.signup" />
          </NamedLink>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};



/**
 * Topbar for desktop layout
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {CurrentUser} props.currentUser API entity
 * @param {string?} props.currentPage
 * @param {boolean} props.isAuthenticated
 * @param {number} props.notificationCount
 * @param {Function} props.onLogout
 * @param {Function} props.onSearchSubmit
 * @param {Object?} props.initialSearchFormValues
 * @param {Object} props.intl
 * @param {Object} props.config
 * @param {boolean} props.showSearchForm
 * @param {boolean} props.showCreateListingsLink
 * @param {string} props.inboxTab
 * @param {Object} props.location
 * @param {Object} props.history
 * @returns {JSX.Element} search icon
 */

const TopbarDesktop = props => {
  const {
    className,
    config,
    customLinks,
    currentUser,
    currentPage,
    rootClassName,
    notificationCount = 0,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues = {},
    showSearchForm,
    showCreateListingsLink,
    inboxTab,
    openCustomFilters,
    location,
    history,
  } = props;
  
  const [mounted, setMounted] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const lastScrollState = useRef(false);
  const debounceTimeout = useRef(null);

  const urlParams = parse(location?.search || '');
  const currentCategoryFromURL = urlParams.pub_categoryLevel1;

  const showCurrencyToggler = config.multiCurrencyEnabled && ['LandingPage', 'search', 'ListingPage'].includes(currentPage);

  useEffect(() => {
    setActiveCategory(currentCategoryFromURL);
  }, [currentCategoryFromURL]);

  const tabCategories = [
    {
      id: 'rentalvillas',
      name: 'PageBuilder.SearchCTA.rentals',
      icon: 'rentals_icon'
    },
    {
      id: 'villaforsale', 
      name: 'PageBuilder.SearchCTA.forSale',
      icon: 'sale_icon'
    },
    {
      id: 'landforsale',
      name: 'PageBuilder.SearchCTA.land', 
      icon: 'icon_Land'
    }
  ];

  const handleTabClick = (categoryId) => {
    const newUrl = `/s?pub_categoryLevel1=${categoryId}`;
    history.push(newUrl);
  };

  useEffect(() => {
    setMounted(true);

    const SCROLL_ADD_CLASS = 100; // px - reduced from 110
    const SCROLL_REMOVE_CLASS = 80; // px - reduced from 90

    const handleScroll = () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        const scrollY = window.scrollY;
        if (!lastScrollState.current && scrollY > SCROLL_ADD_CLASS) {
          setScrollToBottom(true);
          lastScrollState.current = true;
        } else if (lastScrollState.current && scrollY < SCROLL_REMOVE_CLASS) {
          setScrollToBottom(false);
          lastScrollState.current = false;
        }
      }, 100); // Increased debounce from 50ms to 100ms for more stability
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const marketplaceName = config.marketplaceName;
  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const giveSpaceForSearch = customLinks == null || customLinks?.length === 0;

  const classes = classNames(
    rootClassName || css.root,
    className,
    currentPage === 'LandingPage' && css.landingPageTopbar,
    scrollToBottom ? css.scrolledTopbar : null // ensure boolean logic
  );

  const inboxLinkMaybe = authenticatedOnClientSide ? (
    <InboxLink notificationCount={notificationCount} inboxTab={inboxTab} />
  ) : null;

  const profileMenuMaybe = authenticatedOnClientSide ? (
    <ProfileMenu
      currentPage={currentPage}
      currentUser={currentUser}
      onLogout={onLogout}
      showManageListingsLink={showCreateListingsLink}
    />
  ) : (
    <NotSignedInProfileMenu
      scrollToBottom={scrollToBottom}
      currentPage={currentPage}
      customLinks={customLinks}
      intl={intl}
      authenticatedOnClientSide={authenticatedOnClientSide}
      isAuthenticatedOrJustHydrated={isAuthenticatedOrJustHydrated}
    />
  );

  const signupLinkMaybe = isAuthenticatedOrJustHydrated ? null : <SignupLink />;
  const loginLinkMaybe = isAuthenticatedOrJustHydrated ? null : <LoginLink />;

  const searchFormMaybe = showSearchForm ? (
    <TopbarSearchForm
      className={classNames(css.searchLink, { [css.takeAvailableSpace]: giveSpaceForSearch })}
      desktopInputRoot={css.topbarSearchWithLeftPadding}
      onSubmit={onSearchSubmit}
      initialValues={initialSearchFormValues}
      appConfig={config}
      scrollToBottom={scrollToBottom}
    />
  ) : (
    <div
      className={classNames(css.spacer, css.topbarSearchWithLeftPadding, {
        [css.takeAvailableSpace]: giveSpaceForSearch,
      })}
    />
  );

  return (
    <nav className={classes}>
      <div className={css.topbarContent}>
        <LinkedLogo
          className={css.logoLink}
          layout="desktop"
          alt={intl.formatMessage({ id: 'TopbarDesktop.logo' }, { marketplaceName })}
          linkToExternalSite={config?.topbar?.logoLink}
        />
       {currentPage == "search" && <div className={css.filtersWrapper}>
          <div className={css.tabs}>
            {tabCategories.map(category => (
              <div 
                key={category.id}
                className={classNames(css.tab, {
                  [css.activeTab]: activeCategory === category.id
                })}
                onClick={() => handleTabClick(category.id)}
                style={{ cursor: 'pointer' }}
              >
                {activeCategory === category.id ? <div className={css.tabIcon}>
                  <IconCollection name={category.icon} />
                </div> : null}
                <div className={css.tabText}>
                  <FormattedMessage id={category.name} />
                </div>
              </div>
            ))}
          </div>
          <Button className={css.filtersButton} onClick={openCustomFilters}>
            <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.03125 2.50098H13.3438M6.03125 2.50098C6.03125 2.79935 5.91272 3.08549 5.70175 3.29647C5.49077 3.50745 5.20462 3.62598 4.90625 3.62598C4.60788 3.62598 4.32173 3.50745 4.11075 3.29647C3.89978 3.08549 3.78125 2.79935 3.78125 2.50098M6.03125 2.50098C6.03125 2.20261 5.91272 1.91646 5.70175 1.70548C5.49077 1.4945 5.20462 1.37598 4.90625 1.37598C4.60788 1.37598 4.32173 1.4945 4.11075 1.70548C3.89978 1.91646 3.78125 2.20261 3.78125 2.50098M3.78125 2.50098H0.96875M6.03125 11.501H13.3438M6.03125 11.501C6.03125 11.7993 5.91272 12.0855 5.70175 12.2965C5.49077 12.5074 5.20462 12.626 4.90625 12.626C4.60788 12.626 4.32173 12.5074 4.11075 12.2965C3.89978 12.0855 3.78125 11.7993 3.78125 11.501M6.03125 11.501C6.03125 11.2026 5.91272 10.9165 5.70175 10.7055C5.49077 10.4945 5.20462 10.376 4.90625 10.376C4.60788 10.376 4.32173 10.4945 4.11075 10.7055C3.89978 10.9165 3.78125 11.2026 3.78125 11.501M3.78125 11.501H0.96875M10.5312 7.00098H13.3438M10.5312 7.00098C10.5312 7.29935 10.4127 7.58549 10.2017 7.79647C9.99077 8.00745 9.70462 8.12598 9.40625 8.12598C9.10788 8.12598 8.82173 8.00745 8.61075 7.79647C8.39978 7.58549 8.28125 7.29935 8.28125 7.00098M10.5312 7.00098C10.5312 6.70261 10.4127 6.41646 10.2017 6.20548C9.99077 5.9945 9.70462 5.87598 9.40625 5.87598C9.10788 5.87598 8.82173 5.9945 8.61075 6.20548C8.39978 6.41646 8.28125 6.70261 8.28125 7.00098M8.28125 7.00098H0.96875" stroke="white" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round" />
            </svg>
            Filters
          </Button>
        </div>}
        
        <div className={classNames(css.rightMenus, { [css.searchPageTopbarMenu]: currentPage === 'search' })}>
          <CustomLinksMenu
            currentPage={currentPage}
            customLinks={customLinks}
            intl={intl}
            hasClientSideContentReady={authenticatedOnClientSide || !isAuthenticatedOrJustHydrated}
            showCreateListingsLink={showCreateListingsLink}
          />
          {profileMenuMaybe}
          <LanguageCurrencyMenu 
            config={config}
            currentPage={currentPage}
            scrollToBottom={scrollToBottom}
          />
        </div>
      </div>
    </nav>
  );
};

export default (TopbarDesktop);