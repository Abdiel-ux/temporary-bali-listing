import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import * as log from '../../util/log';
import { constructLocalizedPageAssets } from '../../util/localeAssetUtils';
import { customLocationBounds } from '../PageBuilder/SectionBuilder/SectionArticle/PropertyCards';
import { util as sdkUtil } from '../../util/sdkLoader';

export const ASSET_NAME = 'landing-page';

const SEARCH_FEATURED_LISTINGS_REQUEST = 'app/LandingPage/SEARCH_FEATURED_LISTINGS_REQUEST';
const SEARCH_FEATURED_LISTINGS_SUCCESS = 'app/LandingPage/SEARCH_FEATURED_LISTINGS_SUCCESS';
const SEARCH_FEATURED_LISTINGS_ERROR = 'app/LandingPage/SEARCH_FEATURED_LISTINGS_ERROR';

// ================ Reducer ================ //

const initialState = {
  featuredListingIds: [],
  featuredListingsInProgress: false,
  featuredListingsError: null,
};

const resultIds = data => data.data.map(l => l.id);

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case SEARCH_FEATURED_LISTINGS_REQUEST:
      return {
        ...state,
        featuredListingsInProgress: true,
      };

    case SEARCH_FEATURED_LISTINGS_SUCCESS:
      const currentSequence = resultIds(payload.data);

      return {
        ...state,
        featuredListingsInProgress: false,
        featuredListingIds: currentSequence,
      };

    case SEARCH_FEATURED_LISTINGS_ERROR:
      return { ...state, featuredListingsInProgress: false, featuredListingsError: payload };

    default:
      return state;
  }
}

// ================ Action creators ================ //

export const searchFeaturedListingsRequest = () => ({
  type: SEARCH_FEATURED_LISTINGS_REQUEST,
});

export const searchFeaturedListingsSuccess = response => ({
  type: SEARCH_FEATURED_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const searchFeaturedListingsError = e => ({
  type: SEARCH_FEATURED_LISTINGS_ERROR,
  error: true,
  payload: e,
});

// ================ Thunks ================ //

export const fetchFeaturedListings = (
  params = { bounds: customLocationBounds[0].bounds }
) => async (dispatch, getState, sdk) => {
  try {
    dispatch(searchFeaturedListingsRequest());
    const response = await sdk.listings.query({
      ...params,
      perPage: 3,
      include: ['author', 'images'],
      'fields.listing': ['title', 'description', 'geolocation', 'price', 'publicData'],
      'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
      'fields.image': ['variants.landscape-crop2x', 'variants.featured-listing'],
      'imageVariant.featured-listing': sdkUtil.objectQueryString({
        w: 640,
        h: 480,
        fit: 'scale'
      }),
      pub_featured: true,
    });

    dispatch(addMarketplaceEntities(response));
    dispatch(searchFeaturedListingsSuccess(response));
    return response;
  } catch (error) {
    return dispatch(searchFeaturedListingsError(storableError(error)));
  }
};

export const loadData = (params, search, config, match, currentLocale) => dispatch => {
  const assetMap = {
    landingPage: ASSET_NAME,
  };

  const pageAsset = constructLocalizedPageAssets(assetMap, match, currentLocale);

  const pageAssetsPromise = dispatch(fetchPageAssets(pageAsset, true));
  const featuredListingsPromise = dispatch(fetchFeaturedListings());

  return Promise.all([pageAssetsPromise, featuredListingsPromise])
    .then(() => true)
    .catch(e => {
      log.error(e, 'landing-page-fetch-failed');
    });
};
