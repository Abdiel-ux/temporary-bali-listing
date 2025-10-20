import React from 'react';
import { useIntl } from '../../../../util/reactIntl';
import { Link as BaseLink } from 'react-router-dom';

const TranslatedLink = ({ children, ...props }) => {
  const intl = useIntl();

  // Map the original link text to translation IDs
  const getTranslationId = (text) => {
    const textMap = {
      'About Us': 'TranslatedLink.aboutUs',
      'Search listings': 'TranslatedLink.searchListings',
      'Post a new listing': 'TranslatedLink.postNewListing',
      'Terms of service': 'TranslatedLink.termsOfService',
      'Terms of privacy': 'TranslatedLink.termsOfPrivacy',
      'Blog': 'TranslatedLink.blog',
      'Contact us': 'TranslatedLink.contactUs',
      'FAQ': 'TranslatedLink.faq',
    };
    return textMap[text] || null;
  };

  // Check if the child is text that needs translation
  const translateChild = (child) => {
    if (typeof child === 'string') {
      const translationId = getTranslationId(child);
      if (translationId) {
        return intl.formatMessage({ id: translationId });
      }
    }
    return child;
  };

  const translatedChildren = React.Children.map(children, translateChild);

  return <BaseLink {...props}>{translatedChildren}</BaseLink>;
};

export default TranslatedLink;