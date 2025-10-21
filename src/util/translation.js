const getSupportedLocales = () => {
  const defaultLocale = 'en';
  const supportedLocalesEnv = process.env.REACT_APP_SUPPORTED_LOCALES;

  if (supportedLocalesEnv) {
    const locales = supportedLocalesEnv.split(',').map(l => l.trim());
    // Add 'en' if it's not already included to ensure it's always present.
    if (!locales.includes(defaultLocale)) {
      return [defaultLocale, ...locales];
    }
    return locales;
  }

  return [defaultLocale];
};

// Helper function to get the locale from a path
const getLocaleFromPath = (pathname, SUPPORTED_LOCALES) => {
  const pathParts = pathname.split('/').filter(part => part !== '');

  if (pathParts.length > 0 && SUPPORTED_LOCALES.includes(pathParts[0])) {
    return pathParts[0];
  }

  return null;
};

module.exports = {
  getSupportedLocales,
  getLocaleFromPath,
};