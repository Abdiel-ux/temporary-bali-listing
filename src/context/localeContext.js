import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { saveLocale, setLocale } from '../ducks/locale.duck';
const { getSupportedLocales } = require('../util/translation');

export const languageNames = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  id: 'Bahasa Indonesia',
  ru: 'Russian',
};

const SUPPORTED_LOCALES = getSupportedLocales();
const DEFAULT_LOCALE = 'en';

// This function is now only used for initialization in the app.
export const getInitialLocale = currentUser => {
  if (currentUser && currentUser.attributes?.profile?.protectedData?.locale) {
    return currentUser.attributes.profile.protectedData.locale;
  }

  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const pathParts = window.location.pathname.split('/').filter(p => p);
  if (pathParts.length > 0 && SUPPORTED_LOCALES.includes(pathParts[0])) {
    return pathParts[0];
  }

  const storedLocale = localStorage.getItem('locale');
  if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale)) {
    return storedLocale;
  }

  return DEFAULT_LOCALE;
};

export const useLocale = () => {
  const locale = useSelector(state => state.locale.locale);
  const messages = useSelector(state => state.locale.messages);

  return { locale, messages, SUPPORTED_LOCALES, DEFAULT_LOCALE, languageNames };
};

export const useUpdateLocale = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user.currentUser, shallowEqual);

  return newLocale => {
    if (SUPPORTED_LOCALES.includes(newLocale)) {
      if (currentUser) {
        dispatch(saveLocale(newLocale));
      } else {
        localStorage.setItem('locale', newLocale);
        dispatch(setLocale(newLocale));
      }
    }
  };
};
