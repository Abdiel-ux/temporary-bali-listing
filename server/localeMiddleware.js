const { getSupportedLocales, getLocaleFromPath } = require('../src/util/translation');

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = getSupportedLocales();

const localeMiddleware = (req, res, next) => {
  // 1. Determine locale from URL path
  const pathLocale = getLocaleFromPath(req.url, SUPPORTED_LOCALES);

  if (pathLocale) {
    // If locale is in the path, attach it to the request and continue.
    req.locale = pathLocale;
    return next();
  }

  // 2. If no locale in path, check for the user preference cookie.
  const userLocale = req.cookies.userLocale;
  if (userLocale && SUPPORTED_LOCALES.includes(userLocale) && userLocale !== DEFAULT_LOCALE) {
    // If a valid, non-default locale is found in the cookie, redirect.
    const newPath = `/${userLocale}${req.url}`;
    return res.redirect(302, newPath);
  }

  // 3. (Future) IP-based geolocation could be added here as another fallback.

  // 4. If no specific locale is found, fall back to the default.
  req.locale = DEFAULT_LOCALE;
  next();
};

module.exports = localeMiddleware;
