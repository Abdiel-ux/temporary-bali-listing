import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { constructLocalizedPageAssets } from '../../util/localeAssetUtils';

export const ASSET_NAME = 'cms';

export const loadData = (params, search, config, match, currentLocale) => dispatch => {
  const pageId = params.pageId;
  const assetMap = { [pageId]: pageId };

  const pageAsset = constructLocalizedPageAssets(assetMap, match, currentLocale);

  return dispatch(fetchPageAssets(pageAsset, true));
};
