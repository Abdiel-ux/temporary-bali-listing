const path = require('path');
const fs = require('fs');
const { URL } = require('node:url');
const log = require('./log');
const { getRootURL } = require('./api-util/rootURL');
const { fetchConversionRate } = require('./api-util/currency');

const { getSupportedLocales } = require('../src/util/translation');

const PREVENT_DATA_LOADING_IN_SSR = process.env.PREVENT_DATA_LOADING_IN_SSR === 'true';

const extractHostedConfig = configAssets => {
  const configEntries = Object.entries(configAssets);
  return configEntries.reduce((collectedData, [name, content]) => {
    return { ...collectedData, [name]: content?.data || {} };
  }, {});
};

exports.loadData = function(requestUrl, sdk, appInfo) {
  const {
    matchPathname,
    configureStore,
    routeConfiguration,
    defaultConfig,
    mergeConfig,
    fetchAppAssets,
  } = appInfo;
  const { pathname, search } = new URL(`${getRootURL()}${requestUrl}`);

  const SUPPORTED_LOCALES = getSupportedLocales();
  const pathParts = pathname.split('/').filter(p => p);
  const locale = pathParts.length > 0 && SUPPORTED_LOCALES.includes(pathParts[0]) ? pathParts[0] : 'en';

  let translations;
  try {
    const translationPath = path.join(__dirname, '..', 'src', 'translations', `${locale}.json`);
    translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
  } catch (e) {
    const defaultTranslationPath = path.join(__dirname, '..', 'src', 'translations', 'en.json');
    translations = JSON.parse(fs.readFileSync(defaultTranslationPath, 'utf8'));
  }
  let hostedConfig = {};

  const store = configureStore({}, sdk);

  if (PREVENT_DATA_LOADING_IN_SSR) {
    return Promise.resolve({
      preloadedState: store.getState(),
      translations,
      hostedConfig: {},
    });
  }

  const dataLoadingCalls = hostedConfigAsset => {
    const config = mergeConfig(hostedConfigAsset, defaultConfig);
    const matchedRoutes = matchPathname(pathname, routeConfiguration(config.layout));
    const calls = [store.dispatch(fetchConversionRate())];
    return matchedRoutes.reduce((calls, match) => {
      const { route, params } = match;
      if (typeof route.loadData === 'function' && !route.auth) {
        calls.push(store.dispatch(route.loadData(params, search, config, match, locale)));
      }
      return calls;
    }, calls);
  };

  return store
    .dispatch(fetchAppAssets(defaultConfig.appCdnAssets))
    .then(fetchedAppAssets => {
      const { ...rest } = fetchedAppAssets || {};
      hostedConfig = { ...hostedConfig, ...extractHostedConfig(rest) };
      return Promise.all(dataLoadingCalls(hostedConfig));
    })
    .then(() => {
      return { preloadedState: store.getState(), translations, hostedConfig };
    })
    .catch(e => {
      log.error(e, 'server-side-data-load-failed');
      return { preloadedState: store.getState(), translations, hostedConfig };
    });
};
