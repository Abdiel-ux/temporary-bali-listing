const ensureOpenGraphLocale = locale => {
  switch (locale) {
    case 'en':
      return 'en_US';
    default:
      return locale;
  }
};

/**
 * These will be used with Helmet <meta {...openGraphMetaProps} />
 */
export const openGraphMetaProps = data => {
  const {
    openGraphType,
    socialSharingTitle,
    socialSharingDescription,
    published,
    updated,
    url,
    locale,
    facebookImages,
    facebookAppId,
    marketplaceName,
  } = data;

  if (!(socialSharingTitle && socialSharingDescription && openGraphType && url && facebookImages)) {
    /* eslint-disable no-console */
    if (console && console.warn) {
      console.warn(
        `Can't create Open Graph meta tags:
        socialSharingTitle, socialSharingDescription, openGraphType, url, and facebookImages are needed.`
      );
    }
    /* eslint-enable no-console */
    return [];
  }

  const openGraphMeta = [
    { property: 'og:description', content: socialSharingDescription },
    { property: 'og:title', content: socialSharingTitle },
    { property: 'og:type', content: openGraphType },
    { property: 'og:url', content: url },
    { property: 'og:locale', content: ensureOpenGraphLocale(locale) },
  ];

  if (facebookImages && facebookImages.length > 0) {
    facebookImages.forEach(i => {
      openGraphMeta.push({
        property: 'og:image',
        content: i.url,
      });

      if (i.width && i.height) {
        openGraphMeta.push({ property: 'og:image:width', content: i.width });
        openGraphMeta.push({ property: 'og:image:height', content: i.height });
      }
    });
  }

  if (marketplaceName) {
    openGraphMeta.push({ property: 'og:site_name', content: marketplaceName });
  }

  if (facebookAppId) {
    openGraphMeta.push({ property: 'fb:app_id', content: facebookAppId });
  }

  if (published) {
    openGraphMeta.push({ property: 'article:published_time', content: published });
  }

  if (updated) {
    openGraphMeta.push({ property: 'article:modified_time', content: updated });
  }

  return openGraphMeta;
};

/**
 * These will be used with Helmet <meta {...twitterMetaProps} />
 */
export const twitterMetaProps = data => {
  const {
    socialSharingTitle,
    socialSharingDescription,
    twitterHandle,
    twitterImages,
    url,
    marketplaceRootURL,
    siteTwitterHandle,
  } = data;

  if (!(socialSharingTitle && socialSharingDescription && url)) {
    /* eslint-disable no-console */
    if (console && console.warn) {
      console.warn(
        `Can't create twitter card meta tags:
        socialSharingTitle, socialSharingDescription, and url are needed.`
      );
    }
    /* eslint-enable no-console */
    return [];
  }

  const twitterMeta = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: socialSharingTitle },
    { name: 'twitter:description', content: socialSharingDescription },
    { name: 'twitter:url', content: url },
  ];

  if (siteTwitterHandle) {
    twitterMeta.push({ name: 'twitter:site', content: siteTwitterHandle });
  }

  if (twitterImages && twitterImages.length > 0) {
    twitterImages.forEach(i => {
      twitterMeta.push({
        name: 'twitter:image',
        content: i.url,
      });
    });
  }

  if (twitterHandle) {
    // TODO: If we want to connect providers twitter account on ListingPage
    // we needs to get this info among listing data (API support needed)
    twitterMeta.push({ name: 'twitter:creator', content: twitterHandle });
  }

  if (marketplaceRootURL) {
    twitterMeta.push({ name: 'twitter:domain', content: marketplaceRootURL });
  }

  return twitterMeta;
};

/**
 * These will be used with Helmet <meta {...metaTagProps} />
 * Creates data for Open Graph and Twitter meta tags.
 */
export const metaTagProps = (tagData, config) => {
  const {
    marketplaceRootURL,
    facebookAppId,
    marketplaceName,
    siteTwitterHandle,
    googleSearchConsole,
  } = config;

  const author = tagData.author || marketplaceName;
  const googleSiteVerification = googleSearchConsole?.googleSiteVerification;
  const googleSiteVerificationMaybe = googleSiteVerification
    ? [{ name: 'google-site-verification', content: googleSiteVerification }]
    : [];
  const defaultMeta = [
    { name: 'description', content: tagData.description },
    { name: 'author', content: author },
    ...googleSiteVerificationMaybe,
  ];

  const openGraphMeta = openGraphMetaProps({
    ...tagData,
    facebookAppId,
    marketplaceName,
  });

  const twitterMeta = twitterMetaProps({
    ...tagData,
    marketplaceRootURL,
    siteTwitterHandle,
  });

  return [...defaultMeta, ...openGraphMeta, ...twitterMeta];
};

/**
 * Generates hreflang links for multilingual SEO
 * @param {string} currentPath - The current URL path without locale prefix
 * @param {string} currentLocale - The current locale
 * @param {Array} supportedLocales - Array of all supported locales
 * @param {string} marketplaceRootURL - The root URL of the marketplace
 * @returns {Array} Array of link objects for hreflang tags
 */
export const generateHreflangs = (currentPath, currentLocale, supportedLocales, marketplaceRootURL) => {
  const links = [];

  supportedLocales.forEach(locale => {
    // Create the href for each locale
    let href;
    if (locale === 'en') {
      // English is the default, so no prefix
      href = `${marketplaceRootURL}${currentPath}`;
    } else {
      // Other locales have the locale prefix
      href = `${marketplaceRootURL}/${locale}${currentPath}`;
    }

    // Add x-default for the default locale (English)
    if (locale === 'en') {
      links.push({
        rel: 'alternate',
        hrefLang: 'x-default',
        href
      });
    }

    // Add the hreflang for the current locale
    links.push({
      rel: 'alternate',
      hrefLang: locale,
      href
    });
  });

  return links;
};

/**
 * Extracts meta information from page assets data for SEO purposes
 * @param {Object} pageAssetsData - The page assets data containing sections and meta
 * @param {string} schemaType - The schema type for structured data (default: 'WebPage')
 * @returns {Object} Object containing title, description, schema, and socialSharing properties
 */
export const extractPageMetadata = (pageAssetsData, schemaType = 'WebPage') => {
  if (!pageAssetsData) {
    return {
      title: undefined,
      description: undefined,
      schema: undefined,
      socialSharing: undefined
    };
  }

  const meta = pageAssetsData?.meta || {};
  const { pageTitle, pageDescription, socialSharing } = meta;

  // Extract content for meta tags
  const title = pageTitle?.content;
  const description = pageDescription?.content;
  const openGraph = socialSharing;

  // Schema for search engines
  const isArticle = ['Article', 'NewsArticle', 'TechArticle'].includes(schemaType);
  const schemaImage = openGraph?.images1200?.[0]?.url;
  const schemaImageMaybe = schemaImage ? { image: [schemaImage] } : {};
  const schemaHeadlineMaybe = isArticle ? { headline: title } : {};

  const pageSchemaForSEO = {
    '@context': 'http://schema.org',
    '@type': schemaType,
    description: description,
    name: title,
    ...schemaHeadlineMaybe,
    ...schemaImageMaybe,
  };

  // If title or description are not provided, schema should not be created with empty values
  if (!title && !description) {
    delete pageSchemaForSEO.name;
    delete pageSchemaForSEO.description;
  }

  return {
    title,
    description,
    schema: pageSchemaForSEO,
    socialSharing: openGraph,
  };
};
