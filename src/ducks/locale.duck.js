import { updateProfile } from '../containers/ProfileSettingsPage/ProfileSettingsPage.duck';
import { storableError } from '../util/errors';

// ================ Action types ================ //

export const SAVE_LOCALE_REQUEST = 'app/Locale/SAVE_LOCALE_REQUEST';
export const SAVE_LOCALE_SUCCESS = 'app/Locale/SAVE_LOCALE_SUCCESS';
export const SAVE_LOCALE_ERROR = 'app/Locale/SAVE_LOCALE_ERROR';
export const SET_LOCALE = 'app/Locale/SET_LOCALE';
export const SET_MESSAGES = 'app/Locale/SET_MESSAGES';

// ================ Reducer ================ //

const initialState = {
  locale: null, // Will be set in the app initialization
  messages: (() => {
    try {
      return JSON.parse(window.__TRANSLATIONS__);
    } catch (e) {
      return {};
    }
  })(),
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SET_LOCALE:
      return { ...state, locale: payload };
    case SET_MESSAGES:
      return { ...state, messages: payload };
    default:
      return state;
  }
}

// ================ Action creators ================ //

export const saveLocaleRequest = () => ({ type: SAVE_LOCALE_REQUEST });
export const saveLocaleSuccess = () => ({ type: SAVE_LOCALE_SUCCESS });
export const saveLocaleError = e => ({
  type: SAVE_LOCALE_ERROR,
  error: true,
  payload: e,
});

export const setLocale = locale => ({
  type: SET_LOCALE,
  payload: locale,
});

export const setMessages = messages => ({
  type: SET_MESSAGES,
  payload: messages,
});

// ================ Thunks ================ //

export const saveLocale = (locale, messages) => (dispatch, getState) => {
  dispatch(saveLocaleRequest());
  dispatch(setLocale(locale));
  if (messages) {
    dispatch(setMessages(messages));
  }

  const { currentUser } = getState().user;

  if (currentUser) {
    return dispatch(
      updateProfile({
        protectedData: { locale },
      })
    )
      .then(response => {
        dispatch(saveLocaleSuccess());
        return response;
      })
      .catch(e => {
        dispatch(saveLocaleError(storableError(e)));
        throw e;
      });
  } else {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
    dispatch(saveLocaleSuccess());
    return Promise.resolve();
  }
};
