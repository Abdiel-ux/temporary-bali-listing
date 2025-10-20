import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useLocation, useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useLocale, languageNames } from '../../../../../context/localeContext';

const LanguageSelector = ({ isMobile = false }) => {
  const { locale, updateLocale, updateMessages, SUPPORTED_LOCALES, DEFAULT_LOCALE } = useLocale();
  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languageOptions = SUPPORTED_LOCALES.map(code => ({
    code,
    name: languageNames[code] || code,
    shortName: code, // Use the code as the short name
  }));

  const currentLanguage = languageOptions.find(lang => lang.code === locale) || languageOptions[0];

  const handleLanguageChange = newLocale => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    import(`../../../../../translations/${newLocale}.json`)
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

        setIsOpen(false);
      })
      .catch(error => {
        console.error('Failed to load translation', error);
        setIsOpen(false);
      });
  };

  return (
    <div className={css.languageSelector} ref={selectorRef}>
      <button
        className={css.selectorButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={css.currentLanguage}>
          {isMobile ? currentLanguage.shortName : currentLanguage.name}
        </span>
        <span className={css.arrow}>▼</span>
      </button>

      {isOpen && (
        <div className={css.dropdown}>
          <ul className={css.languageList}>
            {languageOptions.map(language => (
              <li key={language.code}>
                <button
                  className={classNames(css.languageOption, {
                    [css.active]: language.code === locale,
                  })}
                  onClick={() => handleLanguageChange(language.code)}
                >
                  {isMobile ? language.shortName : language.name}
                  {language.code === locale && <span className={css.checkmark}>✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
