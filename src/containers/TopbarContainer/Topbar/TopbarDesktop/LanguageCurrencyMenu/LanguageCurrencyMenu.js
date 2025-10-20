import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { saveCurrency } from '../../../../../ducks/currency.js';
import { useLocale, languageNames, useUpdateLocale } from '../../../../../context/localeContext.js';
import { setMessages } from '../../../../../ducks/locale.duck.js';
import { Menu, MenuLabel, MenuContent, MenuItem } from '../../../../../components/index.js';
import { ReactComponent as MenuIcon } from './lang-menu.svg';

import topbarCss from '../TopbarDesktop.module.css';
import css from './LanguageCurrencyMenu.module.css';
import IconLanguage from '../../../../../components/IconLanguage/IconLanguage.js';
import IconCurrency from '../../../../../components/IconCurrency/IconCurrency.js';
import { FormattedMessage } from 'react-intl';

const currencies = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'RP' },
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
];

const LanguageCurrencyMenu = ({ config, currentPage, scrollToBottom }) => {
  const { locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } = useLocale();
  const updateLocale = useUpdateLocale();
  const location = useLocation();
  const history = useHistory();

  const dispatch = useDispatch();
  const selectedCurrency = useSelector(state => state.currency.selectedCurrency);

  const handleCurrencyChange = currency => {
    dispatch(saveCurrency(currency));
  };

  const showCurrencyToggler =
    config.multiCurrencyEnabled && ['LandingPage', 'search', 'ListingPage'].includes(currentPage);
  const showLanguageToggler = SUPPORTED_LOCALES.length > 1 && currentPage !== 'EditListingPage';

  if (!showLanguageToggler && !showCurrencyToggler) {
    return null;
  }

  const onLanguageChange = newLocale => {
    if (newLocale === locale) {
      return;
    }

    import(`../../../../../translations/${newLocale}.json`)
      .then(newMessages => {
        dispatch(setMessages(newMessages.default));
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
      })
      .catch(error => {
        console.error('Failed to load translation', error);
      });
  };

  return (
    <Menu>
      <MenuLabel
        className={topbarCss.profileMenuLabel}
        isOpenClassName={topbarCss.profileMenuIsOpen}
      >
        <div className={classNames(css.menuIcon, scrollToBottom ? css.menuIconBottom : null)}>
          <MenuIcon />
        </div>
      </MenuLabel>
      <MenuContent className={css.menuContent}>
        {showLanguageToggler && (
          <MenuItem key="language-section">
            <div className={css.section}>
              <p className={css.sectionTitle}>
                <IconLanguage />
                <span>
                  <FormattedMessage id="TopbarDesktop.language" />:
                </span>
              </p>
              <div className={css.optionsContainer}>
                {SUPPORTED_LOCALES.map(l => (
                  <button
                    key={l}
                    className={classNames(css.optionButton, {
                      [css.selected]: locale === l,
                    })}
                    onClick={() => onLanguageChange(l)}
                  >
                    {languageNames[l]}
                  </button>
                ))}
              </div>
            </div>
          </MenuItem>
        )}
        {showCurrencyToggler && (
          <MenuItem key="currency-section">
            <div className={css.section}>
              <p className={css.sectionTitle}>
                <IconCurrency />
                <span>
                  <FormattedMessage id="TopbarDesktop.currency" />:
                </span>
              </p>
              <div className={css.optionsContainer}>
                {currencies.map(c => (
                  <button
                    key={c.code}
                    className={classNames(css.optionButton, css.currencyOption, {
                      [css.selected]: selectedCurrency === c.code,
                    })}
                    onClick={() => handleCurrencyChange(c.code)}
                  >
                    <span className={css.currencyName}>{c.name}</span>
                    <span className={css.currencyCode}>
                      {c.code} - {c.symbol}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </MenuItem>
        )}
      </MenuContent>
    </Menu>
  );
};

export default LanguageCurrencyMenu;
