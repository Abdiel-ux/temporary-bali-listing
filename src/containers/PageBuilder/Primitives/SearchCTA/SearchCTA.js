import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import { useHistory } from 'react-router-dom';

// Contexts
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import { useConfiguration } from '../../../../context/configurationContext';

// Utility
import { FormattedMessage } from '../../../../util/reactIntl';
import { createResourceLocatorString } from '../../../../util/routes';
import { isOriginInUse } from '../../../../util/search';
import { stringifyDateToISO8601 } from '../../../../util/dates';

// Shared components
import { Form } from '../../../../components';

import FilterCategories from './FilterCategories/FilterCategories';
import FilterDateRange from './FilterDateRange/FilterDateRange';
import FilterLocation from './FilterLocation/FilterLocation';
import FilterKeyword from './FilterKeyword/FilterKeyword';

import css from './SearchCTA.module.css';
import FilterBedrooms from './FilterBedrooms';
import FilterPrice from './FilterPrice';
import FilterLandSize from './FilterLandSize';
import IconCollection from '../../../../components/IconCollection/IconCollection';

const GRID_CONFIG = [
  { gridCss: css.gridCol1 },
  { gridCss: css.gridCol2 },
  { gridCss: css.gridCol3 },
  { gridCss: css.gridCol4 },
];

const tabs = [
  { label: 'PageBuilder.SearchCTA.rentals', key: 'rentalvillas' },
  { label: 'PageBuilder.SearchCTA.forSale', key: 'villaforsale' },
  { label: 'PageBuilder.SearchCTA.land', key: 'landforsale' },
];

const getGridCount = numberOfFields => {
  const gridConfig = GRID_CONFIG[numberOfFields - 1];
  return gridConfig ? gridConfig.gridCss : GRID_CONFIG[0].gridCss;
};

const isEmpty = value => {
  if (value == null) return true;
  return value.hasOwnProperty('length') && value.length === 0;
};

const formatDateValue = (dateRange, queryParamName) => {
  const hasDates = dateRange;
  const { startDate, endDate } = hasDates ? dateRange : {};
  const start = startDate ? stringifyDateToISO8601(startDate) : null;
  const end = endDate ? stringifyDateToISO8601(endDate) : null;
  const value = start && end ? `${start},${end}` : null;
  return { [queryParamName]: value };
};

export const SearchCTA = React.forwardRef((props, ref) => {
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const config = useConfiguration();
  const [activeTab, setActiveTab] = useState(0);
  const [isOpenBedrooms, setIsOpenBedrooms] = useState(false);
  const [isOpenPrice, setIsOpenPrice] = useState(false);
  const [isOpenLandSize, setIsOpenLandSize] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  const { categories, dateRange, keywordSearch, locationSearch, price } = props.searchFields;
  const bedrooms = tabs[activeTab].key !== 'landforsale';
  const landSize = tabs[activeTab].key === 'landforsale';

  const [submitDisabled, setSubmitDisabled] = useState(false);

  useEffect(() => {
    setIsFormReady(true);
  }, []);

  const categoryConfig = config.categoryConfiguration;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const filters = {
    categories: {
      enabled: categories,
      isValid: () => categoryConfig.categories.length > 0,
      render: alignLeft => (
        <div className={css.filterField} key="categories">
          <FilterCategories categories={categoryConfig.categories} alignLeft={alignLeft} />
        </div>
      ),
    },
    keywordSearch: {
      enabled: keywordSearch,
      isValid: () => keywordSearch,
      render: alignLeft => (
        <div className={css.filterField} key="keywordSearch">
          <FilterKeyword />
        </div>
      ),
    },
    locationSearch: {
      enabled: locationSearch,
      isValid: () => locationSearch,
      render: alignLeft => (
        <div className={css.filterField} key="locationSearch">
          <FilterLocation
            setSubmitDisabled={setSubmitDisabled}
            alignLeft={alignLeft}
            setIsOpenBedrooms={setIsOpenBedrooms}
            setIsOpenLandSize={setIsOpenLandSize}
            landSize={landSize}
            isMobile={isMobile}
          />
        </div>
      ),
    },
    dateRange: {
      enabled: dateRange,
      isValid: () => dateRange,
      render: alignLeft => (
        <div className={css.filterField} key="dateRange">
          <FilterDateRange config={config} alignLeft={alignLeft} />
        </div>
      ),
    },
    bedrooms: {
      enabled: bedrooms,
      isValid: () => bedrooms,
      render: alignLeft => (
        <div className={css.filterField} key="bedrooms">
          <FilterBedrooms
            isOpen={isOpenBedrooms}
            setIsOpen={setIsOpenBedrooms}
            setIsOpenPrice={setIsOpenPrice}
          />
        </div>
      ),
    },
    price: {
      enabled: price,
      isValid: () => price,
      render: alignLeft => (
        <div className={css.filterField} key="price">
          <FilterPrice
            activeTabKey={tabs[activeTab].key}
            isOpen={isOpenPrice}
            setIsOpen={setIsOpenPrice}
          />
        </div>
      ),
    },
    landSize: {
      enabled: landSize,
      isValid: () => landSize,
      render: alignLeft => (
        <div className={css.filterField} key="landSize">
          <FilterLandSize
            isOpen={isOpenLandSize}
            setIsOpen={setIsOpenLandSize}
            setIsOpenPrice={setIsOpenPrice}
          />
        </div>
      ),
    },
  };

  const addFilters = filterOrder => {
    const enabledFilters = filterOrder.filter(
      key => filters[key]?.enabled && filters[key]?.isValid()
    );

    const totalEnabled = enabledFilters.length;

    return enabledFilters.map((key, index) => {
      const filter = filters[key];
      const isLast = index === totalEnabled - 1;
      const alignLeft = totalEnabled === 1 || !isLast;

      return filter.enabled && filter.isValid() ? filter.render(alignLeft) : null;
    });
  };

  // Count the number search fields that are enabled
  const fieldCountForGrid = Object.values(filters).filter(field => field.enabled && field.isValid())
    .length;

  //  If no search fields are enabled, we return null (Console won't allow you to enable 0 search fields)
  if (!fieldCountForGrid) {
    return null;
  }

  const onSubmit = values => {
    // Convert form values to query parameters
    let queryParams = {
      pub_categoryLevel1: tabs[activeTab].key,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (!isEmpty(value)) {
        if (key == 'dateRange') {
          const { dates } = formatDateValue(value, 'dates');
          queryParams.dates = dates;
        } else if (key == 'location') {
          if (value.selectedPlace) {
            const {
              search,
              selectedPlace: { origin, bounds },
            } = value;
            queryParams.bounds = bounds;
            queryParams.address = search;

            if (isOriginInUse(config) && origin) {
              queryParams.origin = `${origin.lat},${origin.lng}`;
            }
          }
        } else if (key === 'pub_bedrooms') {
          if (value === 0) {
            return;
          }
          queryParams[key] = value;
        } else if (key === 'pub_price') {
          let priceKey = '';
          if (tabs[activeTab].key !== 'rentalvillas') {
            priceKey = 'price';
          } else if (value.period === 'monthly') {
            priceKey = 'pub_monthprice';
          } else if (value.period === 'yearly') {
            priceKey = 'pub_yearprice';
          } else {
            priceKey = 'pub_weekprice';
          }
          queryParams[priceKey] = `${value.minPrice},${value.maxPrice}`;
        } else if (key === 'pub_landSize') {
          queryParams['pub_landsize'] = `${value.minSize},${value.maxSize}`;
          return;
        } else {
          queryParams[key] = value;
        }
      }
    });

    const to = createResourceLocatorString('SearchPage', routeConfiguration, {}, queryParams);
    history.push(to);
  };

  return (
    <>
      <div className={css.heroTabs}>
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={idx === activeTab ? `${css.heroTab} ${css.active}` : css.heroTab}
            onClick={() => setActiveTab(idx)}
            type="button"
          >
            <FormattedMessage id={tab.label} />
          </button>
        ))}
      </div>
      <div className={classNames(css.searchBarContainer, getGridCount(fieldCountForGrid))}>
        <FinalForm
          onSubmit={onSubmit}
          {...props}
          render={({ fieldRenderProps, handleSubmit }) => {
            return (
              <Form
                role="search"
                onSubmit={handleSubmit}
                className={classNames(css.gridContainer, getGridCount(fieldCountForGrid))}
              >
                {addFilters([
                  'locationSearch',
                  'bedrooms',
                  'landSize',
                  'price',
                  'categories',
                  'keywordSearch',
                  'dateRange',
                ])}

                <button disabled={!isFormReady || submitDisabled} className={css.submitButton} type="submit">
                  <span className={css.searchIcon}>
                    <IconCollection name="search_icon" />
                  </span>
                  <FormattedMessage id="PageBuilder.SearchCTA.buttonLabel" />
                </button>
              </Form>
            );
          }}
        />
      </div>
    </>
  );
});

SearchCTA.displayName = 'SearchCTA';
