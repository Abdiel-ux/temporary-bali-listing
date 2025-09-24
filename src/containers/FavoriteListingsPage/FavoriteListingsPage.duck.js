// src/ducks/FavoriteListingsPage.duck.js
import { storableError } from '../../util/errors';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { parse } from '../../util/urlHelpers';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck'; // Tambahkan import ini

// Pagination page size might need to be dynamic on responsive page layouts
const RESULT_PAGE_SIZE = 42;

// ================ Action types ================ //
export const FAVORITES_CLEAR = 'app/FavoriteListingsPage/FAVORITES_CLEAR';
export const FAVORITES_UNFAVORITE = 'app/FavoriteListingsPage/FAVORITES_UNFAVORITE'; // new
export const FETCH_LISTINGS_REQUEST = 'app/FavoriteListingsPage/FETCH_LISTINGS_REQUEST';
export const FETCH_LISTINGS_SUCCESS = 'app/FavoriteListingsPage/FETCH_LISTINGS_SUCCESS';
export const FETCH_LISTINGS_ERROR = 'app/FavoriteListingsPage/FETCH_LISTINGS_ERROR';

// ================ Reducer ================ //

const initialState = {
  pagination: null,
  queryParams: null,
  queryInProgress: false,
  queryFavoritesError: null,
  currentPageResultIds: [],
};

const resultIds = data => data.data.map(l => l.id);

// Thunk: unfavoriteAllListings
export const unfavoriteAllListings = () => async (dispatch, getState, sdk) => {
  const { currentUser } = getState().user;

  // Jika tidak ada currentUser, cukup bersihkan state halaman
  if (!currentUser) {
    dispatch(unfavoriteAllSuccess());
    return Promise.resolve();
  }

  const profile = currentUser.attributes?.profile || {};

  const payload = {
    privateData: {
      ...profile.privateData,
      favorites: [],
    },
  };

  try {
    // Update server: hapus semua favorites
    const response = await sdk.currentUser.updateProfile(payload);

    // Refresh global currentUser agar state app sinkron
    await dispatch(fetchCurrentUser());

    // Hapus semua favorites dari state halaman (UI responsif)
    dispatch(unfavoriteAllSuccess());

    return response;
  } catch (e) {
    console.error('❌ unfavoriteAllListings failed:', e);
    throw e;
  }
};

const favoriteListingsPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case FETCH_LISTINGS_REQUEST:
      return {
        ...state,
        queryParams: payload.queryParams,
        queryInProgress: true,
        queryFavoritesError: null,
        currentPageResultIds: [],
      };
    case FETCH_LISTINGS_SUCCESS:
      return {
        ...state,
        currentPageResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        queryInProgress: false,
      };
    case FETCH_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return {
        ...state,
        queryInProgress: false,
        queryFavoritesError: payload
      };

    case FAVORITES_UNFAVORITE:
      // payload.listingId is a uuid string; currentPageResultIds is array of id objects
      return {
        ...state,
        currentPageResultIds: state.currentPageResultIds.filter(
          idObj => idObj?.uuid !== payload.listingId
        ),
      };

    case FAVORITES_CLEAR:
      return {
        ...state,
        currentPageResultIds: [],
        pagination: null,
      };

    default:
      return state;
  }
};

export default favoriteListingsPageReducer;

// ================ Action creators ================ //

export const queryFavoritesRequest = queryParams => ({
  type: FETCH_LISTINGS_REQUEST,
  payload: { queryParams },
});

export const queryFavoritesSuccess = response => ({
  type: FETCH_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const queryFavoritesError = e => ({
  type: FETCH_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const unfavoriteSuccess = listingId => ({
  type: FAVORITES_UNFAVORITE,
  payload: { listingId },
});

// Action to clear all favorites from page state (used after successful server update)
export const unfavoriteAllSuccess = () => ({
  type: FAVORITES_CLEAR,
});

// ================ Thunks ================ //

// Query favorite listings (unchanged, only slightly annotated)
export const queryFavoriteListings = queryParams => (dispatch, getState, sdk) => {
  dispatch(queryFavoritesRequest(queryParams));
  const { currentUser } = getState().user;
  const { favorites } = currentUser?.attributes.profile.privateData || {};

  console.log('=== 🚀 DEBUGGING QUERY FAVORITE LISTINGS ===');
  console.log('👤 Current user:', currentUser);
  console.log('❤️  User favorites IDs:', favorites);
  console.log('📋 Query params:', queryParams);

  const favoritesMaybe = favorites ? { ids: favorites } : {};
  const { perPage, ...rest } = queryParams;
  const params = { ...favoritesMaybe, ...rest, perPage };

  console.log('🔍 Final API params:', params);

  return sdk.listings
    .query(params)
    .then(response => {
      console.log('✅ API Response received:', response);
      console.log('📊 Number of listings:', response.data?.data?.length || 0);

      dispatch(addMarketplaceEntities(response));
      dispatch(queryFavoritesSuccess(response));
      return response;
    })
    .catch(e => {
      console.error('❌ API Error:', e);
      dispatch(queryFavoritesError(storableError(e)));
      throw e;
    });
};

/**
 * Thunk: unfavoriteListing(listingId)
 *
 * - Mengambil currentUser dari state
 * - Menghapus listingId dari array favorites (privateData)
 * - Memanggil sdk.currentUser.updateProfile untuk menyimpan perubahan
 * - Setelah sukses -> dispatch(unfavoriteSuccess(listingId)) agar halaman favorit
 *   segera menghapus listing dari currentPageResultIds (UI responsif)
 *
 * Note: jika Anda ingin juga memperbarui state.user.currentUser secara global,
 * Anda bisa memanggil fetchCurrentUser() atau dispatch action yang sesuai di user.duck.
 */
export const unfavoriteListing = listingId => async (dispatch, getState, sdk) => {
  const { currentUser } = getState().user;

  // Jika tidak ada currentUser, langsung hapus di UI dan selesai
  if (!currentUser) {
    dispatch(unfavoriteSuccess(listingId));
    return Promise.resolve();
  }

  const profile = currentUser.attributes?.profile || {};
  const favorites = profile.privateData?.favorites || [];

  const updatedFavorites = favorites.filter(id => id !== listingId);

  const payload = {
    privateData: {
      ...profile.privateData,
      favorites: updatedFavorites,
    },
  };

  try {
    // Update profile di server
    const response = await sdk.currentUser.updateProfile(payload);

    // Pastikan Redux currentUser ter-refresh dari server sebelum kita memutuskan state halaman
    // agar tidak terjadi race condition saat halaman direload
    await dispatch(fetchCurrentUser());

    // Update local page state sehingga UI langsung merefleksikan perubahan
    dispatch(unfavoriteSuccess(listingId));

    return response;
  } catch (e) {
    console.error('❌ unfavoriteListing failed:', e);
    throw e;
  }

};


export const loadData = (params, search, config) => {
  const queryParams = parse(search);
  const page = queryParams.page || 1;

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const aspectRatio = aspectHeight / aspectWidth;

  console.log('=== 🔧 LOAD DATA CONFIGURATION ===');
  console.log('🖼️ Image config:', { aspectWidth, aspectHeight, variantPrefix, aspectRatio });

  // Perbaikan: Tingkatkan limit gambar dan tambah variant yang lebih lengkap
  const imageVariantConfig = {
    ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
  };

  console.log('🎨 Image variant config:', imageVariantConfig);

  const apiParams = {
    ...queryParams,
    page,
    perPage: RESULT_PAGE_SIZE,
    include: ['images', 'author'],
    'fields.image': [
      `variants.${variantPrefix}`,
      `variants.${variantPrefix}-2x`,
      'variants.scaled-small',
      'variants.scaled-medium',
      'variants.scaled-large',
      'variants.landscape-crop',
      'variants.landscape-crop2x'
    ],
    ...imageVariantConfig,
    'limit.images': 99,
  };

  console.log('📡 Final API params for loadData:', apiParams);

  return queryFavoriteListings(apiParams);
};
