import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { setCurrency } from '../../../../ducks/currency.js';
import { useLocale, languageNames } from '../../../../context/localeContext';
import { Menu, MenuLabel, MenuContent, MenuItem } from '../../../../components';

import topbarCss from './TopbarDesktop.module.css';
import css from './LanguageCurrencyMenu.module.css';
import IconLanguage from '../../../../components/IconLanguage/IconLanguage.js';
import IconCurrency from '../../../../components/IconCurrency/IconCurrency.js';

const currencies = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'RP' },
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
];

const LanguageCurrencyMenu = ({ config, currentPage }) => {
  const { locale, updateLocale, updateMessages, SUPPORTED_LOCALES, DEFAULT_LOCALE } = useLocale();
  const location = useLocation();
  const history = useHistory();

  const dispatch = useDispatch();
  const selectedCurrency = useSelector(state => state.currency.selectedCurrency);

  const handleCurrencyChange = currency => {
    dispatch(setCurrency(currency));
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
        <div className={topbarCss.profileMenuIcon}>
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="44" height="44" rx="22" fill="white" fillOpacity="0.3" />
            <path
              d="M21 15L23 17L21 19M21 15L19 17L21 19M21 15V19M31 23C31 25.0806 30.347 27.0962 29.1742 28.7426C28.0014 30.3891 26.3787 31.5815 24.5 32.1447M31 23C31 20.9194 30.347 18.9038 29.1742 17.2574C28.0014 15.6109 26.3787 14.4185 24.5 13.8553M31 23H27M13 21C13 18.9194 13.653 16.9038 14.8258 15.2574C15.9986 13.6109 17.6213 12.4185 19.5 11.8553M13 21C13 23.0806 13.653 25.0962 14.8258 26.7426C15.9986 28.3891 17.6213 29.5815 19.5 30.1447M13 21H17M25 13C25.2652 13 25.5196 13.1054 25.7071 13.2929C25.8946 13.4804 26 13.7348 26 14C26 14.2652 25.8946 14.5196 25.7071 14.7071C25.5196 14.8946 25.2652 15 25 15C24.7348 15 24.4804 14.8946 24.2929 14.7071C24.1054 14.5196 24 14.2652 24 14C24 13.7348 24.1054 13.4804 24.2929 13.2929C24.4804 13.1054 24.7348 13 25 13Z"
              stroke="#231F20"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </MenuLabel>
      <MenuContent className={css.menuContent}>
        {showLanguageToggler && (
          <MenuItem key="language-section">
            <div className={css.section}>
              <p className={css.sectionTitle}>
                <IconLanguage /> Language:
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
                <IconCurrency /> Currency:
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
