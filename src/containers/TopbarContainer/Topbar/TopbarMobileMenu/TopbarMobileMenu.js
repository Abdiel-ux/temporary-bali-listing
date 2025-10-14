/**
 *  TopbarMobileMenu prints the menu content for authenticated user or
 * shows login actions for those who are not authenticated.
 */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import classNames from 'classnames';

import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { FormattedMessage } from '../../../../util/reactIntl';
import { ensureCurrentUser } from '../../../../util/data';
import { setCurrency } from '../../../../ducks/currency.js';
import { useLocale, languageNames } from '../../../../context/localeContext';
import vectorIcon from './img/Vector.png';


import {
  AvatarMedium,
  ExternalLink,
  InlineTextButton,
  NamedLink,
  NotificationBadge,
} from '../../../../components';

import css from './TopbarMobileMenu.module.css';

const CustomLinkComponent = ({ linkConfig, currentPage }) => {
  const { text, type, href, route } = linkConfig;
  const getCurrentPageClass = page => {
    const hasPageName = name => currentPage?.indexOf(name) === 0;
    const isCMSPage = pageId => hasPageName('CMSPage') && currentPage === `${page}:${pageId}`;
    const isInboxPage = tab => hasPageName('InboxPage') && currentPage === `${page}:${tab}`;
    const isCurrentPage = currentPage === page;

    return isCMSPage(route?.params?.pageId) || isInboxPage(route?.params?.tab) || isCurrentPage
      ? css.currentPage
      : null;
  };

  if (type === 'internal' && route) {
    const { name, params, to } = route || {};
    const className = classNames(css.navigationLink, getCurrentPageClass(name));
    return (
      <NamedLink name={name} params={params} to={to} className={className}>
        <span className={css.menuItemBorder} />
        {text}
      </NamedLink>
    );
  }
  return (
    <ExternalLink href={href} className={css.navigationLink}>
      <span className={css.menuItemBorder} />
      {text}
    </ExternalLink>
  );
};

// Currency options - sama dengan di LanguageCurrencyMenu
const currencies = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'RP' },
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
];

/**
 * Menu for mobile layout (opens through hamburger icon)
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isAuthenticated
 * @param {string?} props.currentPage
 * @param {boolean} props.currentUserHasListings
 * @param {Object?} props.currentUser API entity
 * @param {number} props.notificationCount
 * @param {Array<Object>} props.customLinks Contains object like { group, text, type, href, route }
 * @param {Function} props.onLogout
 * @returns {JSX.Element} search icon
 */
const TopbarMobileMenu = props => {
  const {
    isAuthenticated,
    currentPage,
    currentUser,
    notificationCount = 0,
    customLinks,
    onLogout,
    showCreateListingsLink,
    config,
  } = props;

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  
  // Tambahkan hooks untuk language & currency
  const dispatch = useDispatch();
  const selectedCurrency = useSelector(state => state.currency.selectedCurrency);
  const { locale, updateLocale, updateMessages, SUPPORTED_LOCALES, DEFAULT_LOCALE } = useLocale();
  const location = useLocation();
  const history = useHistory();

  const user = ensureCurrentUser(currentUser);

  // Language options - ambil dari SUPPORTED_LOCALES
  const languages = SUPPORTED_LOCALES.map(localeCode => ({
    code: localeCode,
    name: languageNames[localeCode] || localeCode
  }));

  // Tentukan nama bahasa yang terpilih
  const selectedLanguageName = languageNames[locale] || 'English';

  const extraLinks = customLinks.map((linkConfig, index) => {
    return (
      <CustomLinkComponent
        key={`${linkConfig.text}_${index}`}
        linkConfig={linkConfig}
        currentPage={currentPage}
      />
    );
  });

  const handleLanguageToggle = () => {
    setIsLanguageOpen(!isLanguageOpen);
    setIsCurrencyOpen(false);
  };

  const handleCurrencyToggle = () => {
    setIsCurrencyOpen(!isCurrencyOpen);
    setIsLanguageOpen(false);
  };

  // Ganti dengan logic sebenarnya untuk language
  const handleLanguageSelect = (language) => {
    const newLocale = language.code;
    
    if (newLocale === locale) {
      setIsLanguageOpen(false);
      return;
    }

    import(`../../../../translations/${newLocale}.json`)
      .then(newMessages => {
        updateMessages(newMessages.default);
        updateLocale(newLocale);

        if (newLocale === DEFAULT_LOCALE) {
          localStorage.setItem('useDefaultLocale', 'true');
        } else {
          localStorage.setItem('useDefaultLocale', 'false');
        }

        const pathParts = location.pathname.split('/').filter(part => part !== '');

        let newPath = location.pathname;
        if (pathParts.length > 0 && SUPPORTED_LOCALES.includes(pathParts[0])) {
          if (newLocale === DEFAULT_LOCALE) {
            newPath = '/' + pathParts.slice(1).join('/') + location.search + location.hash;
          } else {
            pathParts[0] = newLocale;
            newPath = '/' + pathParts.join('/') + location.search + location.hash;
          }
        } else if (newLocale !== DEFAULT_LOCALE) {
          const cleanPath = location.pathname.startsWith('/')
            ? location.pathname.substring(1)
            : location.pathname;
          newPath = `/${newLocale}/${cleanPath}${location.search}${location.hash}`;
        }

        history.push(newPath);
        setIsLanguageOpen(false);
      })
      .catch(error => {
        console.error('Failed to load translation', error);
        setIsLanguageOpen(false);
      });
  };

  const handleCurrencySelect = (currency) => {
    dispatch(setCurrency(currency.code));
    setIsCurrencyOpen(false);
  };

  const showCurrencyToggler = config ? config.multiCurrencyEnabled : (process.env?.REACT_APP_MULTICURRENCY_ENABLED === 'true');
  const showLanguageToggler = SUPPORTED_LOCALES?.length > 1 && currentPage !== 'EditListingPage';


  if (!isAuthenticated) {
    return (
      <div className={css.root}>
        <div className={css.content}>
        {/* Add listing button */}
        <div className={css.addListingSection}>
          <NamedLink name="NewListingPage" className={css.createNewListingLink}>
            <FormattedMessage id="TopbarMobileMenu.newListingLink" />
          </NamedLink>
        </div>

        {/* Authentication section */}
        <div className={css.authenticationSection}>
          <div className={css.authenticationLinks}>
            <NamedLink name="SignupPage" className={css.signupLink}>
              <FormattedMessage id="TopbarMobileMenu.signupLink" />
            </NamedLink>
            <NamedLink name="LoginPage" className={css.loginLink}>
              <FormattedMessage id="TopbarMobileMenu.loginLink" />
            </NamedLink>
          </div>
        </div>

        {/* Settings section */}
          <div className={css.settingsSection}>
            {/* Language Dropdown - hanya tampilkan jika showLanguageToggler true */}
            {showLanguageToggler && (
              <div className={css.dropdownContainer}>
                <div className={css.settingItem} onClick={handleLanguageToggle}>
                  <span className={css.settingLabel}>Language</span>
                  <img src={vectorIcon} alt="description" className={classNames(css.vectorIcon, { [css.arrowOpen]: isLanguageOpen })}/>
                </div>
                {isLanguageOpen && (
                  <div className={css.dropdownMenu}>
                    {languages.map((lang) => (
                      <div
                        key={lang.code}
                        className={classNames(css.dropdownItem, {
                          [css.selectedItem]: locale === lang.code
                        })}
                        onClick={() => handleLanguageSelect(lang)}
                      >
                        {lang.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Currency Dropdown - hanya tampilkan jika showCurrencyToggler true */}
            {showCurrencyToggler && (
              <div className={css.dropdownContainer}>
                <div className={css.settingItem} onClick={handleCurrencyToggle}>
                  <span className={css.settingLabel}>Currency</span>
                  <img src={vectorIcon} alt="description" className={classNames(css.vectorIcon, { [css.arrowOpen]: isCurrencyOpen })}/>
                </div>
                {isCurrencyOpen && (
                  <div className={css.dropdownMenu}>
                    {currencies.map((curr) => (
                      <div
                        key={curr.code}
                        className={classNames(css.dropdownItem, {
                          [css.selectedItem]: selectedCurrency === curr.code
                        })}
                      onClick={() => handleCurrencySelect(curr)}
                      >
                        <div className={css.currencyInfo}>
                          <span className={css.currencyName}>{curr.name}</span>
                          <span className={css.currencyCode}>{curr.code} - {curr.symbol}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Custom links */}
        {extraLinks.length > 0 && (
          <div className={css.customLinksWrapper}>
            {extraLinks}
          </div>
        )}      
        </div>
        </div>
    );
  }

  const notificationCountBadge =
    notificationCount > 0 ? (
      <NotificationBadge className={css.notificationBadge} count={notificationCount} />
    ) : null;

  const displayName = user.attributes.profile.firstName;
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    const isInboxPage = currentPage?.indexOf('InboxPage') === 0 && page?.indexOf('InboxPage') === 0;
    return currentPage === page || isAccountSettingsPage || isInboxPage ? css.currentPage : null;
  };

  const manageListingsLinkMaybe = showCreateListingsLink ? (
    <NamedLink
      className={classNames(css.navigationLink, currentPageClass('ManageListingsPage'))}
      name="ManageListingsPage"
    >
      <FormattedMessage id="TopbarMobileMenu.yourListingsLink" />
    </NamedLink>
  ) : null;

  return (
    <div className={css.root}>
      <AvatarMedium className={css.avatar} user={currentUser} />
      <div className={css.content}>
        <span className={css.greeting}>
          <FormattedMessage id="TopbarMobileMenu.greeting" values={{ displayName }} />
        </span>
        <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
          <FormattedMessage id="TopbarMobileMenu.logoutLink" />
        </InlineTextButton>

        <div className={css.accountLinksWrapper}>
          {manageListingsLinkMaybe}
          <NamedLink
            className={classNames(css.navigationLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <FormattedMessage id="TopbarMobileMenu.profileSettingsLink" />
          </NamedLink>
          <NamedLink
            className={classNames(css.navigationLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <FormattedMessage id="TopbarMobileMenu.accountSettingsLink" />
          </NamedLink>
        </div>

        {/* Tambahkan Language & Currency untuk user yang sudah login juga */}
        <div className={css.settingsSection}>
          {showLanguageToggler && (
            <div className={css.dropdownContainer}>
              <div className={css.settingItem} onClick={handleLanguageToggle}>
                <span className={css.settingLabel}>Language</span>
                <img src={vectorIcon} alt="description" className={classNames(css.vectorIcon, { [css.arrowOpen]: isLanguageOpen })}/>
              </div>
              {isLanguageOpen && (
                <div className={css.dropdownMenu}>
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className={classNames(css.dropdownItem, {
                        [css.selectedItem]: locale === lang.code
                      })}
                      onClick={() => handleLanguageSelect(lang)}
                    >
                      {lang.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showCurrencyToggler && (
            <div className={css.dropdownContainer}>
              <div className={css.settingItem} onClick={handleCurrencyToggle}>
                <span className={css.settingLabel}>Currency</span>
                <img src={vectorIcon} alt="description" className={classNames(css.vectorIcon, { [css.arrowOpen]: isCurrencyOpen })}/>
              </div>
              {isCurrencyOpen && (
                <div className={css.dropdownMenu}>
                  {currencies.map((curr) => (
                    <div
                      key={curr.code}
                      className={classNames(css.dropdownItem, {
                        [css.selectedItem]: selectedCurrency === curr.code
                      })}
                    onClick={() => handleCurrencySelect(curr)}
                    >
                      <div className={css.currencyInfo}>
                        <span className={css.currencyName}>{curr.name}</span>
                        <span className={css.currencyCode}>{curr.code} - {curr.symbol}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {extraLinks.length > 0 && (
          <div className={css.customLinksWrapper}>
            {extraLinks}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopbarMobileMenu;