import { updateProfile } from '../containers/ProfileSettingsPage/ProfileSettingsPage.duck';
import { storableError } from '../util/errors';

const FETCH_CONVERSION_RATE_REQUEST = 'app/currency/FETCH_CONVERSION_RATE_REQUEST';
const FETCH_CONVERSION_RATE_SUCCESS = 'app/currency/FETCH_CONVERSION_RATE_SUCCESS';
const FETCH_CONVERSION_RATE_ERROR = 'app/currency/FETCH_CONVERSION_RATE_ERROR';

const SET_CURRENCY = 'app/currency/SET_CURRENCY';

const SAVE_CURRENCY_REQUEST = 'app/currency/SAVE_CURRENCY_REQUEST';
const SAVE_CURRENCY_SUCCESS = 'app/currency/SAVE_CURRENCY_SUCCESS';
const SAVE_CURRENCY_ERROR = 'app/currency/SAVE_CURRENCY_ERROR';

const initialState = {
  conversionRate: {
    USD: 0.00005982,
    IDR: 1,
  },
  fetchConversionRateInProgress: false,
  fetchConversionRateError: null,
  selectedCurrency: null, // Will be set in app initialization
  saveCurrencyInProgress: false,
  saveCurrencyError: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_CONVERSION_RATE_REQUEST:
      return {
        ...state,
        fetchConversionRateInProgress: true,
        fetchConversionRateError: null,
      };
    case FETCH_CONVERSION_RATE_SUCCESS:
      return {
        ...state,
        conversionRate: action.payload,
        fetchConversionRateInProgress: false,
      };
    case FETCH_CONVERSION_RATE_ERROR:
      return {
        ...state,
        fetchConversionRateInProgress: false,
        fetchConversionRateError: action.payload,
      };
    case SET_CURRENCY:
      return {
        ...state,
        selectedCurrency: action.payload,
      };
    case SAVE_CURRENCY_REQUEST:
      return { ...state, saveCurrencyInProgress: true, saveCurrencyError: null };
    case SAVE_CURRENCY_SUCCESS:
      return { ...state, saveCurrencyInProgress: false };
    case SAVE_CURRENCY_ERROR:
      return { ...state, saveCurrencyInProgress: false, saveCurrencyError: action.payload };
    default:
      return state;
  }
}

export const fetchConversionRateRequest = () => ({ type: FETCH_CONVERSION_RATE_REQUEST });
export const fetchConversionRateSuccess = rate => ({
  type: FETCH_CONVERSION_RATE_SUCCESS,
  payload: rate,
});
export const fetchConversionRateError = error => ({
  type: FETCH_CONVERSION_RATE_ERROR,
  payload: error,
});

export const setCurrency = currency => ({
  type: SET_CURRENCY,
  payload: currency,
});

const saveCurrencyRequest = () => ({ type: SAVE_CURRENCY_REQUEST });
const saveCurrencySuccess = () => ({ type: SAVE_CURRENCY_SUCCESS });
const saveCurrencyError = e => ({
  type: SAVE_CURRENCY_ERROR,
  error: true,
  payload: e,
});

export const saveCurrency = currency => (dispatch, getState) => {
  dispatch(saveCurrencyRequest());
  dispatch(setCurrency(currency));

  const { currentUser } = getState().user;

  if (currentUser) {
    return dispatch(
      updateProfile({
        protectedData: { currency },
      })
    )
      .then(response => {
        dispatch(saveCurrencySuccess());
        return response;
      })
      .catch(e => {
        dispatch(saveCurrencyError(storableError(e)));
        throw e;
      });
  } else {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', currency);
    }
    dispatch(saveCurrencySuccess());
    return Promise.resolve();
  }
};

export const fetchConversionRate = () => (dispatch, getState, sdk) => {
  dispatch(fetchConversionRateRequest());
  return sdk.currency.getConversionRate()
    .then(response => {
      dispatch(fetchConversionRateSuccess(response.data));
      return response;
    })
    .catch(e => {
      dispatch(fetchConversionRateError(e));
      throw e;
    });
};

const DEFAULT_CURRENCY = 'IDR';
const SUPPORTED_CURRENCIES = ['IDR', 'USD'];

export const getInitialCurrency = currentUser => {
  if (currentUser && currentUser.attributes?.profile?.protectedData?.currency) {
    const storedCurrency = currentUser.attributes.profile.protectedData.currency;
    if (SUPPORTED_CURRENCIES.includes(storedCurrency)) {
      return storedCurrency;
    }
  }

  if (typeof window === 'undefined') {
    return DEFAULT_CURRENCY;
  }

  const storedCurrency = localStorage.getItem('currency');
  if (storedCurrency && SUPPORTED_CURRENCIES.includes(storedCurrency)) {
    return storedCurrency;
  }

  return DEFAULT_CURRENCY;
};