import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { constructLocalizedPageAssets } from '../../util/localeAssetUtils';

export const TOS_ASSET_NAME = 'terms-of-service';
export const PRIVACY_POLICY_ASSET_NAME = 'privacy-policy';

export const loadData = (params, search, config, match, currentLocale) => dispatch => {
  const assetMap = {
    termsOfService: TOS_ASSET_NAME,
    privacyPolicy: PRIVACY_POLICY_ASSET_NAME,
  };

  const pageAsset = constructLocalizedPageAssets(assetMap, match, currentLocale);

  return dispatch(fetchPageAssets(pageAsset, true));
};
