import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import {
  isFieldForListingType,
  pickCustomFieldProps,
  isFieldForCategory,
  pickCategoryFields,
} from '../../util/fieldHelpers';

import css from './ListingPage.module.css';
import IconCollection from '../../components/IconCollection/IconCollection';

const SectionHeading = props => {
  const {
    publicData,
    metadata = {},
    listingFieldConfigs,
    intl,
    categoryConfiguration,
    location,
  } = props;

  if (!publicData || !listingFieldConfigs) {
    return null;
  }
  const { key: categoryPrefix, categories: listingCategoriesConfig } = categoryConfiguration;
  const categoriesObj = pickCategoryFields(publicData, categoryPrefix, 1, listingCategoriesConfig);
  const currentCategories = Object.values(categoriesObj);

  const isFieldForSelectedCategories = fieldConfig => {
    const isTargetCategory = isFieldForCategory(currentCategories, fieldConfig);
    return isTargetCategory;
  };
  const propsForCustomFields =
    pickCustomFieldProps(
      publicData,
      metadata,
      listingFieldConfigs,
      'listingType',
      isFieldForSelectedCategories
    ) || [];

  const pickListingFields = (filteredConfigs, config) => {
    const { key, schemaType, enumOptions, showConfig = {} } = config;
    const listingType = publicData.listingType;
    const isTargetListingType = isFieldForListingType(listingType, config);
    const isTargetCategory = isFieldForSelectedCategories(config);

    const { isDetail, label } = showConfig;
    const publicDataValue = publicData[key];
    const metadataValue = metadata[key];
    const value = typeof publicDataValue != null ? publicDataValue : metadataValue;

    if (isDetail && isTargetListingType && isTargetCategory && typeof value !== 'undefined') {
      const findSelectedOption = enumValue => enumOptions?.find(o => enumValue === `${o.option}`);
      const getBooleanMessage = value =>
        value
          ? intl.formatMessage({ id: 'SearchPage.detailYes' })
          : intl.formatMessage({ id: 'SearchPage.detailNo' });
      const optionConfig = findSelectedOption(value);

      return schemaType === 'enum'
        ? filteredConfigs.concat({ key, value: optionConfig?.label, label })
        : schemaType === 'boolean'
        ? filteredConfigs.concat({ key, value: getBooleanMessage(value), label })
        : schemaType === 'long'
        ? filteredConfigs.concat({ key, value, label })
        : filteredConfigs;
    }
    return filteredConfigs;
  };

  const existingListingFields = listingFieldConfigs.reduce(pickListingFields, []);

  return existingListingFields.length > 0 ? (
    <>
      <div className={css.sectionLocationHeading}>
        {existingListingFields.map(detail =>
          detail.key === 'propertytype' ? (
            <div key={detail.key} className={css.detailsTypeRow}>
              <svg
                width="15"
                height="14"
                viewBox="0 0 15 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2434_1039)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.70312 10.7296C1.99109 10.7926 2.24922 10.9378 2.45219 11.14C2.51469 11.1289 2.57906 11.123 2.64469 11.123C3.06109 11.123 3.42359 11.3588 3.61047 11.7066C4.17125 11.7579 4.61141 12.2384 4.61141 12.8227C4.61141 12.853 4.61016 12.883 4.60781 12.9128H5.22625C5.19813 12.8016 5.18313 12.6848 5.18313 12.5647C5.18313 11.9872 5.52906 11.4913 6.02125 11.2804V6.3479H1.70312V10.7296ZM4.15953 7.4216H4.12562C3.80187 7.4216 3.49125 7.5527 3.26234 7.78576C3.03328 8.01899 2.90469 8.3351 2.90469 8.6649V10.5158C2.90469 10.8276 3.15297 11.0804 3.45922 11.0804H4.82609C5.13234 11.0804 5.38062 10.8276 5.38062 10.5158V8.6649C5.38062 8.3351 5.25188 8.01899 5.02297 7.78576C4.79391 7.5527 4.48344 7.4216 4.15953 7.4216ZM3.90828 10.6031H3.45922C3.41188 10.6031 3.37344 10.564 3.37344 10.5158V9.67226H3.90828V10.6031ZM4.91187 9.67226V10.5158C4.91187 10.564 4.87344 10.6031 4.82609 10.6031H4.37703V9.67226H4.91187ZM3.90828 7.93165V9.19499H3.37344V8.6649C3.37344 8.46174 3.45266 8.26686 3.59375 8.1232C3.68219 8.03315 3.79063 7.96776 3.90828 7.93165ZM4.37703 7.93165C4.49469 7.96776 4.60297 8.03315 4.69156 8.1232C4.8325 8.26686 4.91187 8.46174 4.91187 8.6649V9.19499H4.37703V7.93165Z"
                    fill="#818181"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.81775 2.44775H4.20525C4.119 2.44775 4.0365 2.48323 3.97618 2.54591C3.59134 2.94714 2.12087 4.47966 1.31775 5.3168C1.22775 5.4105 1.20165 5.55019 1.25165 5.67109C1.30165 5.792 1.4179 5.87059 1.54681 5.87059H6.01837V5.39062H5.76212C5.43993 5.39062 5.15009 5.19112 5.03009 4.88646C4.90993 4.58196 4.984 4.23371 5.21681 4.007L6.81775 2.44775Z"
                    fill="#818181"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.1477 12.9127C12.4412 12.7054 11.8741 11.9127 11.8741 10.9181C11.8741 10.4919 11.9778 10.0978 12.15 9.77579V9.77563C12.2223 9.64056 12.2483 9.47161 12.2278 9.30743C12.2178 9.22947 12.2128 9.14929 12.2128 9.06768C12.2128 8.15688 12.8344 7.47454 13.5131 7.47454V5.39061H13.448C13.2448 5.39061 13.0494 5.3109 12.9027 5.16788L9.99875 2.33972L7.095 5.16788C6.94812 5.3109 6.75281 5.39061 6.54969 5.39061H6.48438V11.1734C6.50453 11.1724 6.52469 11.172 6.54516 11.172C6.90375 11.172 7.23031 11.3128 7.47406 11.5428C7.51922 11.5364 7.56531 11.5333 7.61219 11.5333C7.97719 11.5333 8.29687 11.7324 8.47172 12.0299C8.47687 12.0307 8.48203 12.0314 8.48719 12.0322V8.57434C8.48719 7.75406 9.14016 7.08906 9.94578 7.08906H10.0519C10.8573 7.08906 11.5105 7.75406 11.5105 8.57434V12.9127H13.1477ZM8.95594 12.2353V8.57434C8.95594 8.01768 9.39906 7.56634 9.94578 7.56634H10.0517C10.5986 7.56634 11.0417 8.01768 11.0417 8.57434V12.9127H9.32938C9.32938 12.875 9.325 12.8372 9.31609 12.7998C9.26156 12.5723 9.13203 12.3745 8.95594 12.2353ZM9.31969 9.31029V9.69211C9.31969 9.82368 9.42469 9.93074 9.55406 9.93074C9.68344 9.93074 9.78844 9.82368 9.78844 9.69211V9.31029C9.78844 9.17856 9.68344 9.07165 9.55406 9.07165C9.42469 9.07165 9.31969 9.17856 9.31969 9.31029ZM9.99875 3.80861C9.48328 3.80861 9.06469 4.23481 9.06469 4.75965C9.06469 5.28465 9.48328 5.71086 9.99875 5.71086C10.5144 5.71086 10.933 5.28465 10.933 4.75965C10.933 4.23481 10.5144 3.80861 9.99875 3.80861ZM9.99875 4.28588C10.2556 4.28588 10.4642 4.49811 10.4642 4.75965C10.4642 5.0212 10.2556 5.23359 9.99875 5.23359C9.74187 5.23359 9.53344 5.0212 9.53344 4.75965C9.53344 4.49811 9.74187 4.28588 9.99875 4.28588Z"
                    fill="#818181"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M13.2797 12.4571C12.7459 12.3114 12.3438 11.6772 12.3438 10.918C12.3438 10.5773 12.4248 10.2615 12.5625 10.0041C12.6795 9.7853 12.7269 9.51294 12.6938 9.24742C12.6863 9.18887 12.6825 9.1289 12.6825 9.06765C12.6825 8.4518 13.0552 7.95178 13.5141 7.95178C13.9731 7.95178 14.3458 8.4518 14.3458 9.06765C14.3458 9.1289 14.342 9.18887 14.335 9.24742C14.302 9.51278 14.3492 9.78499 14.4661 10.0036C14.6034 10.2615 14.6845 10.5773 14.6845 10.918C14.6845 11.6772 14.2823 12.3114 13.7484 12.4571V10.012C13.7484 9.88028 13.6434 9.77337 13.5141 9.77337C13.3848 9.77337 13.2797 9.88028 13.2797 10.012V12.4571Z"
                    fill="#818181"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.55573 4.91333C6.63823 4.91333 6.71745 4.88103 6.77698 4.82297C7.22057 4.39103 9.12901 2.53238 9.78354 1.8949C9.90729 1.77431 10.1023 1.77431 10.2262 1.8949C10.8807 2.53238 12.7892 4.39103 13.2326 4.82297C13.2923 4.88103 13.3715 4.91333 13.454 4.91333H14.2442C14.3749 4.91333 14.4926 4.83235 14.5414 4.70874C14.5901 4.58513 14.5599 4.44385 14.4656 4.3519C13.3549 3.27024 10.9639 0.941466 10.2262 0.223012C10.1023 0.102421 9.90729 0.102421 9.78354 0.223012C9.04589 0.941466 6.65464 3.27024 5.54417 4.3519C5.44964 4.44385 5.41964 4.58513 5.46839 4.70874C5.51698 4.83235 5.63464 4.91333 5.76542 4.91333H6.55573Z"
                    fill="#818181"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.529375 12.9128C0.393281 12.7306 0.3125 12.5034 0.3125 12.257C0.3125 11.6582 0.79 11.172 1.37812 11.172C1.76875 11.172 2.11047 11.3865 2.29609 11.7059C2.39562 11.6391 2.51484 11.6003 2.64297 11.6003C2.98563 11.6003 3.26484 11.8784 3.27469 12.2247C3.34719 12.1953 3.42625 12.179 3.50891 12.179C3.85766 12.179 4.14094 12.4675 4.14094 12.8227C4.14094 12.8533 4.13875 12.8833 4.13469 12.9128H0.529375Z"
                    fill="#818181"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.71578 12.9128C5.67234 12.8054 5.64844 12.6878 5.64844 12.5647C5.64844 12.0594 6.05125 11.6493 6.54734 11.6493C6.87688 11.6493 7.16516 11.8302 7.32172 12.0997C7.40578 12.0434 7.50625 12.0106 7.61438 12.0106C7.90344 12.0106 8.13891 12.2452 8.14734 12.5373C8.20844 12.5125 8.275 12.4988 8.34484 12.4988C8.59547 12.4988 8.80594 12.6754 8.86281 12.9128H5.71578Z"
                    fill="#818181"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.3125 13.8673H14.6875C14.8169 13.8673 14.9219 13.7604 14.9219 13.6287C14.9219 13.4969 14.8169 13.39 14.6875 13.39H0.3125C0.183125 13.39 0.078125 13.4969 0.078125 13.6287C0.078125 13.7604 0.183125 13.8673 0.3125 13.8673Z"
                    fill="#818181"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2434_1039">
                    <rect width="15" height="14" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className={css.detailTypeValue}>{detail.value}</span>
            </div>
          ) : null
        )}
        <div className={css.location}>
          <svg
            width="10"
            height="13"
            viewBox="0 0 10 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M4.73167 12.0381L4.7725 12.0614L4.78883 12.0708C4.8536 12.1058 4.92608 12.1241 4.99971 12.1241C5.07334 12.1241 5.14581 12.1058 5.21058 12.0708L5.22692 12.062L5.26833 12.0381C5.49648 11.9028 5.71911 11.7584 5.93567 11.6053C6.49629 11.2094 7.02011 10.7639 7.50075 10.2741C8.63475 9.11325 9.8125 7.36908 9.8125 5.125C9.8125 3.84865 9.30547 2.62457 8.40295 1.72205C7.50043 0.81953 6.27635 0.3125 5 0.3125C3.72365 0.3125 2.49957 0.81953 1.59705 1.72205C0.69453 2.62457 0.1875 3.84865 0.1875 5.125C0.1875 7.3685 1.36583 9.11325 2.49925 10.2741C2.97971 10.7639 3.50333 11.2094 4.06375 11.6053C4.2805 11.7584 4.50332 11.9028 4.73167 12.0381ZM5 6.875C5.46413 6.875 5.90925 6.69063 6.23744 6.36244C6.56563 6.03425 6.75 5.58913 6.75 5.125C6.75 4.66087 6.56563 4.21575 6.23744 3.88756C5.90925 3.55937 5.46413 3.375 5 3.375C4.53587 3.375 4.09075 3.55937 3.76256 3.88756C3.43437 4.21575 3.25 4.66087 3.25 5.125C3.25 5.58913 3.43437 6.03425 3.76256 6.36244C4.09075 6.69063 4.53587 6.875 5 6.875Z"
              fill="#818181"
            />
          </svg>
          {location}
        </div>
      </div>

      <section className={css.sectionDetails}>
        <ul className={css.detailsType}>
          {existingListingFields.map(detail =>
            detail.key === 'bedrooms' || detail.key === 'bathrooms' ? (
              <li key={detail.key} className={css.detailsTypeRow}>
                <IconCollection name={detail.key === 'bedrooms' ? 'bed_icon' : 'bathroom_icon'} />
                <span className={css.detailTypeValue}>
                  {detail.value}{' '}
                  {intl.formatMessage(
                    { id: `ListingCard.${detail.key === 'bedrooms' ? 'bedroom' : 'bathroom'}` },
                    { count: Number(detail.value) }
                  )}
                </span>
              </li>
            ) : detail.key === 'landsize' || detail.key === 'landzone' ? (
              <li key={detail.key} className={css.detailsTypeRow}>
                {detail.key === 'landsize' ? (
                  <IconCollection name="landzone_icon" />
                ) : (
                  <IconCollection name="zone_icon" />
                )}
                <span className={css.detailTypeValue}>
                  {detail.value} {detail.key === 'landsize' ? 'm2' : 'zone'}
                </span>
              </li>
            ) : null
          )}
        </ul>
      </section>
    </>
  ) : null;
};

export default SectionHeading;
