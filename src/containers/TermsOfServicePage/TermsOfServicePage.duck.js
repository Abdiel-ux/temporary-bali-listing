import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { constructLocalizedPageAssets } from '../../util/localeAssetUtils';

export const ASSET_NAME = 'terms-of-service';

export const loadData = (params, search, config, match, currentLocale) => dispatch => {
  const assetMap = {
    termsOfService: ASSET_NAME,
  };

  const pageAsset = constructLocalizedPageAssets(assetMap, match, currentLocale);
  
  return dispatch(fetchPageAssets(pageAsset, true));
};
