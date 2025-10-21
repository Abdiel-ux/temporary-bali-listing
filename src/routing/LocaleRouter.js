import React, { useEffect } from 'react';
import { BrowserRouter, StaticRouter, useLocation, useHistory } from 'react-router-dom';
import { useLocale, useUpdateLocale } from '../context/localeContext';

// This component handles locale detection and redirection
const LocaleHandler = ({ isServer = false }) => {
  const { locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } = useLocale();
  const updateLocale = useUpdateLocale();
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (isServer) return;

    // Extract locale from the URL path
    const pathParts = location.pathname.split('/').filter(part => part !== '');

    // If the first part of the path is a supported locale
    if (pathParts.length > 0 && SUPPORTED_LOCALES.includes(pathParts[0])) {
      const urlLocale = pathParts[0];

      // If it's different from the current locale, update it
      if (urlLocale !== locale) {
        updateLocale(urlLocale);
        // When user explicitly selects a locale via URL, clear the useDefaultLocale flag
        if (urlLocale === DEFAULT_LOCALE) {
          localStorage.setItem('useDefaultLocale', 'true');
        } else {
          localStorage.setItem('useDefaultLocale', 'false');
        }
      }
    } else {
      // If no locale in URL, check if we need to redirect to the current locale from state
      // But only redirect if the locale is NOT the default locale
      const useDefaultLocale = localStorage.getItem('useDefaultLocale') === 'true';

      if (
        locale &&
        SUPPORTED_LOCALES.includes(locale) &&
        locale !== DEFAULT_LOCALE &&
        !useDefaultLocale
      ) {
        // Redirect to the same path with locale prefix
        const newPath = `/${locale}${location.pathname}${location.search}${location.hash}`;
        history.replace(newPath);
      }
    }
  }, [
    location.pathname,
    locale,
    updateLocale,
    SUPPORTED_LOCALES,
    DEFAULT_LOCALE,
    isServer,
    history,
  ]);

  return null;
};

// Locale-aware BrowserRouter for client-side
export const LocaleBrowserRouter = ({ children, ...rest }) => {
  return (
    <BrowserRouter {...rest}>
      <LocaleHandler />
      {children}
    </BrowserRouter>
  );
};

// Locale-aware StaticRouter for server-side
export const LocaleStaticRouter = ({ location, context, children, ...rest }) => {
  return (
    <StaticRouter location={location} context={context} {...rest}>
      <LocaleHandler isServer={true} />
      {children}
    </StaticRouter>
  );
};

// Helper function to add locale prefix to a path
export const addLocaleToPath = (pathname, locale, SUPPORTED_LOCALES, DEFAULT_LOCALE) => {
  // If locale is not supported or is the default, don't add prefix
  if (!SUPPORTED_LOCALES.includes(locale) || locale === DEFAULT_LOCALE) {
    return pathname;
  }

  // Remove leading slash if present
  const cleanPath = pathname.startsWith('/') ? pathname.substring(1) : pathname;

  // Add locale prefix
  return `/${locale}/${cleanPath}`;
};

// Helper function to remove locale prefix from a path
export const removeLocaleFromPath = (pathname, SUPPORTED_LOCALES) => {
  const pathParts = pathname.split('/').filter(part => part !== '');

  if (pathParts.length > 0 && SUPPORTED_LOCALES.includes(pathParts[0])) {
    // Remove the locale part and reconstruct the path
    const newPath = '/' + pathParts.slice(1).join('/');
    return newPath || '/';
  }

  return pathname;
};

