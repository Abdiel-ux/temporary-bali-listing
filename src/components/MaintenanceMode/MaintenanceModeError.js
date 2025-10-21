import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import mapValues from 'lodash/mapValues';

import { IntlProvider } from '../../util/reactIntl';
import MaintenanceMode from '../../components/MaintenanceMode/MaintenanceMode';
import defaultMessages from '../../translations/en.json';
import { addMissingTranslations } from '../../util/configHelpers';

const isTestEnv = process.env.NODE_ENV === 'test';

const MaintenanceModeError = props => {
  const { locale, helmetContext, hostedTranslations = {} } = props;

  const localeMessages = isTestEnv
    ? mapValues(defaultMessages, (val, key) => key)
    : defaultMessages;

  const finalMessages = addMissingTranslations(defaultMessages, {
    ...localeMessages,
    ...hostedTranslations,
  });

  return (
    <IntlProvider locale={locale} messages={finalMessages} textComponent="span">
      <HelmetProvider context={helmetContext}>
        <MaintenanceMode />
      </HelmetProvider>
    </IntlProvider>
  );
};

export default MaintenanceModeError;
