import React, { useState } from 'react';
import css from './CustomFilters.module.css';
import CategorySelector from './CategorySelector/CategorySelector';
import LocationSelector from './LocationSelector/LocationSelector';
import PriceSelector from './PriceSelector/PriceSelector';
import SimplePriceSelector from './SimplePriceSelector/SimplePriceSelector';
import BedroomsSelector from './BedroomsSelector/BedroomsSelector';
import BathroomsSelector from './BathroomsSelector/BathroomsSelector';
import AmenitiesSelector from './AmenitiesSelector/AmenitiesSelector';
import PropertyTypeSelector from './PropertyTypeSelector/PropertyTypeSelector';
import AvailabilitySelector from './AvailabilitySelector/AvailabilitySelector';
import ServicesSelector from './ServicesSelector/ServicesSelector';
import PropertyDetailsSelector from './PropertyDetailsSelector/PropertyDetailsSelector';
import HostTypeSelector from './HostTypeSelector/HostTypeSelector';
import TenureSelector from './TenureSelector/TenureSelector';
import LandTitleSelector from './LandTitleSelector/LandTitleSelector';
import LandZoneSelector from './LandZoneSelector/LandZoneSelector';
import { useHistory } from 'react-router-dom';
import IconCollection from '../../../components/IconCollection/IconCollection';
import { FormattedMessage } from 'react-intl';

// Configuration for which filters each category needs
const categoryFilterConfig = {
  rentalvillas: [
    'price',
    'bedrooms',
    'bathrooms',
    'amenities',
    'propertyType',
    'availability',
    'services',
    'propertyDetails',
    'hostType',
  ],
  villaforsale: [
    'simplePrice',
    'tenure',
    'bedrooms',
    'bathrooms',
    'amenities',
    'propertyType',
    'propertyDetails',
    'landTitle',
    'landZone',
    'hostType',
  ],
  landforsale: ['tenure', 'simplePrice', 'landSize', 'hostType', 'landTitle', 'landZone'],
};

const initialiseCategory = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('pub_categoryLevel1') || 'rentalvillas';
  }
};

const initialiseBedrooms = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return Number(urlParams.get('pub_bedrooms')) || 0;
  }
};

const initialiseBathrooms = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return Number(urlParams.get('pub_bathrooms')) || 0;
  }
};

const initialisePropertyType = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyType = urlParams.get('pub_propertytype') || null;
    return propertyType ? propertyType.split(',') : [];
  }
};

const initialiseHostType = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('pub_agentorowner') || null;
  }
};

const initialiseTenure = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('pub_Freehold') || null;
  }
};

const initialiseAvailability = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('pub_availableper') || null;
  }
};

const initialisePropertyDetail = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const living = urlParams.get('pub_living') || null;
    const furnished = urlParams.get('pub_furnished') || null;
    const result = [];
    if (living) {
      const livingTypes = living.split(',');
      result.push(
        ...livingTypes.map(type => (type === 'open' ? 'open-livingroom' : 'closed-livingroom'))
      );
    }

    if (furnished) {
      const furnishedTypes = furnished.split(',');
      result.push(...furnishedTypes.map(type => (type === 'yes' ? 'furnished' : 'unfurnished')));
    }

    return result;
  }
};

const allPubAmentiesKeys = [
  'pub_pool',
  'pub_wifi',
  'pub_gym',
  'pub_workingdesk',
  'pub_carparking',
  'pub_airco',
  'pub_kitchen',
  'pub_petfriendly',
];

const allPubServicesKeys = [
  'pub_cleaning_weekly',
  'pub_electricity',
  'pub_pool_maintenance',
];

const initialiseAmenities = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);

    const amenities = [];

    allPubAmentiesKeys.forEach(elm => {
      if (urlParams.get(elm)) {
        if (elm === 'pub_pool') {
          amenities.push('pool');
        } else if (elm === 'pub_wifi') {
          amenities.push('wifi');
        } else if (elm === 'pub_gym') {
          amenities.push('gym');
        } else if (elm === 'pub_workingdesk') {
          amenities.push('workingdesk');
        } else if (elm === 'pub_carparking') {
          amenities.push('carparking');
        } else if (elm === 'pub_airco') {
          amenities.push('airco');
        } else if (elm === 'pub_kitchen') {
          amenities.push('kitchen');
        } else if (elm === 'pub_petfriendly') {
          amenities.push('petfriendly');
        }
      }
    });

    return amenities;
  }
};

const initialiseServices = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const services = [];
    allPubServicesKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        if (key === 'pub_cleaning_weekly') {
          if (value === '1,2,3,4,5,6,7') {
            services.push(key.replace('pub_', ''));
          }
        } else {
          if (value === 'yes') {
            services.push(key.replace('pub_', ''));
          }
        }
      }
    });
    return services;
  }
  return [];
};

const initialiseLandSize = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const landSize = urlParams.get('pub_landsize') || null;
    const splitLandSize = landSize ? landSize.split(',') : null;
    return splitLandSize ? [Number(splitLandSize[0]), Number(splitLandSize[1])] : [100, 50000];
  }
};

const initialisePrice = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const price = urlParams.get('price') || null;
    const splitPrice = price ? price.split(',') : null;
    return splitPrice ? [Number(splitPrice[0]), Number(splitPrice[1])] : [1000000, 999000000000];
  }
};

const initialiseMainPrice = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const weekprice = urlParams.get('pub_weekprice') || null;
    const monthprice = urlParams.get('pub_monthprice') || null;
    const yearprice = urlParams.get('pub_yearprice') || null;

    if (weekprice) {
      const splitWeekprice = weekprice.split(',');
      return [Number(splitWeekprice[0]), Number(splitWeekprice[1])];
    } else if (monthprice) {
      const splitMonthprice = monthprice.split(',');
      return [Number(splitMonthprice[0]), Number(splitMonthprice[1])];
    } else if (yearprice) {
      const splitYearprice = yearprice.split(',');
      return [Number(splitYearprice[0]), Number(splitYearprice[1])];
    }
    return [1000000, 500000000];
  }
};

const initialisePricePeriod = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const weekprice = urlParams.get('pub_weekprice') || null;
    const monthprice = urlParams.get('pub_monthprice') || null;
    const yearprice = urlParams.get('pub_yearprice') || null;

    if (weekprice) {
      return 'weekly';
    } else if (monthprice) {
      return 'monthly';
    } else if (yearprice) {
      return 'yearly';
    } else {
      return 'monthly';
    }
  }
};

const initialiseLandTitles = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('pub_landtitle') || null;

    return data ? data.split(',') : [];
  }
};

const initialiseLandZones = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('pub_landzone') || null;

    return data ? data.split(',') : [];
  }
};

function CustomFilters({
  onClose,
  onReset = () => {},
  onShowListings = () => {},
  resultsCount,
  onUpdateCurrentQueryParams,
  currentQueryParams,
  onlyUpdateCurrentQueryParams,
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialiseCategory);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(initialisePricePeriod);
  const [priceRange, setPriceRange] = useState(initialiseMainPrice);
  const [simplePriceRange, setSimplePriceRange] = useState(initialisePrice);
  const [landSizeRange, setLandSizeRange] = useState(initialiseLandSize);
  const [bedrooms, setBedrooms] = useState(initialiseBedrooms);
  const [bathrooms, setBathrooms] = useState(initialiseBathrooms);
  const [selectedAmenities, setSelectedAmenities] = useState(initialiseAmenities);
  const [selectedPropertyType, setSelectedPropertyType] = useState(initialisePropertyType);
  const [selectedAvailability, setSelectedAvailability] = useState(initialiseAvailability);
  const [selectedServices, setSelectedServices] = useState(initialiseServices);
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState(initialisePropertyDetail);
  const [selectedHostType, setSelectedHostType] = useState(initialiseHostType);
  const [selectedTenure, setSelectedTenure] = useState(initialiseTenure);
  const [selectedLandTitles, setSelectedLandTitles] = useState(initialiseLandTitles);
  const [selectedLandZones, setSelectedLandZones] = useState(initialiseLandZones);
  const history = useHistory();

  // Get available filters for current category
  const availableFilters = categoryFilterConfig[selectedCategory] || [];

  const handleCategoryChange = categoryId => {
    setSelectedCategory(categoryId);

    onlyUpdateCurrentQueryParams({
      pub_categoryLevel1: categoryId,
    });

    // Reset filters that are not available in the new category
    const newAvailableFilters = categoryFilterConfig[categoryId] || [];

    if (
      !newAvailableFilters.includes('price') &&
      !newAvailableFilters.includes('simplePrice') &&
      !newAvailableFilters.includes('landSize')
    ) {
      setSelectedPeriod('monthly');
      setPriceRange([1000000, 500000000]);
      setSimplePriceRange([1000000, 999000000000]);
      setLandSizeRange([100, 50000]);
    }
    if (!newAvailableFilters.includes('bedrooms')) {
      setBedrooms(0);
    }
    if (!newAvailableFilters.includes('bathrooms')) {
      setBathrooms(0);
    }
    if (!newAvailableFilters.includes('amenities')) {
      setSelectedAmenities([]);
    }
    if (!newAvailableFilters.includes('propertyType')) {
      setSelectedPropertyType([]);
    }
    if (!newAvailableFilters.includes('availability')) {
      setSelectedAvailability(null);
    }
    if (!newAvailableFilters.includes('services')) {
      setSelectedServices([]);
    }
    if (!newAvailableFilters.includes('propertyDetails')) {
      setSelectedPropertyDetail([]);
    }
    if (!newAvailableFilters.includes('hostType')) {
      setSelectedHostType(null);
    }
    if (!newAvailableFilters.includes('tenure')) {
      setSelectedTenure(null);
    }
    if (!newAvailableFilters.includes('landTitle')) {
      setSelectedLandTitles([]);
    }
    if (!newAvailableFilters.includes('landZone')) {
      setSelectedLandZones([]);
    }
  };

  const handleLocationChange = location => {
    onUpdateCurrentQueryParams({
      address: location.selectedPlace.address,
      bounds: location.selectedPlace.bounds,
    });
  };

  const handleLocationReset = () => {
    setSelectedLocation(null);
    onUpdateCurrentQueryParams({
      address: null,
      bounds: null,
    });
  };

  const handlePeriodChange = period => {
    setSelectedPeriod(period);
  };

  const handlePriceRangeChange = (range, period) => {
    let pub_weekprice = null,
      pub_monthprice = null,
      pub_yearprice = null;

    if (period === 'weekly') {
      pub_weekprice = range.toString();
    } else if (period === 'monthly') {
      pub_monthprice = range.toString();
    } else if (period === 'yearly') {
      pub_yearprice = range.toString();
    }

    const paramsToUpdate = {
      pub_weekprice,
      pub_monthprice,
      pub_yearprice,
    };

    // Update price sorting
    const currentSort = currentQueryParams.sort;
    if (currentSort && currentSort.includes('price')) {
      const isAscending = currentSort.startsWith('-');
      const priceKeyMap = {
        weekly: 'pub_weekprice',
        monthly: 'pub_monthprice',
        yearly: 'pub_yearprice',
      };
      const newSortKey = priceKeyMap[period];
      if (newSortKey) {
        paramsToUpdate.sort = isAscending ? `-${newSortKey}` : newSortKey;
      }
    }
    onUpdateCurrentQueryParams(paramsToUpdate);
  };

  const handleSimplePriceRangeChange = range => {
    onUpdateCurrentQueryParams({
      price: range.toString(),
    });
  };

  const handleLandSizeRangeChange = range => {
    onUpdateCurrentQueryParams({
      pub_landsize: range.toString(),
    });
  };

  const handleBedroomsChange = value => {
    onUpdateCurrentQueryParams({
      pub_bedrooms: value === 0 ? null : value,
    });
    setBedrooms(value);
  };

  const handleBathroomsChange = value => {
    onUpdateCurrentQueryParams({
      pub_bathrooms: value === 0 ? null : value,
    });
    setBathrooms(value);
  };

  const handleBedroomsReset = () => {
    onUpdateCurrentQueryParams({
      pub_bedrooms: null,
    });
    setBedrooms(0);
  };

  const handleBathroomsReset = () => {
    onUpdateCurrentQueryParams({
      pub_bathrooms: null,
    });
    setBathrooms(0);
  };

  const handleAmenitiesChange = amenities => {
    const params = {};
    const addPub = amenities.map(elm => `pub_${elm}`);

    addPub.forEach(elm => {
      params[elm] = 'yes';
    });

    const removePub = allPubAmentiesKeys.filter(elm => !addPub.includes(elm));

    removePub.forEach(elm => (params[elm] = null));

    onUpdateCurrentQueryParams(params);

    setSelectedAmenities(amenities);
  };

  const handleAmenitiesReset = () => {
    const params = {};
    allPubAmentiesKeys.forEach(elm => (params[elm] = null));
    onUpdateCurrentQueryParams(params);
    setSelectedAmenities([]);
  };

  const handlePropertyTypeChange = propertyType => {
    const paramValue = !propertyType || (Array.isArray(propertyType) && propertyType.length === 0) 
      ? null 
      : propertyType.toString();

    onUpdateCurrentQueryParams({
      pub_propertytype: paramValue,
    });
    setSelectedPropertyType(propertyType);
  };

  const handlePropertyTypeReset = () => {
    onUpdateCurrentQueryParams({
      pub_propertytype: null,
    });
    setSelectedPropertyType([]);
  };

  const handleAvailabilityChange = availability => {
    onUpdateCurrentQueryParams({
      pub_availableper: availability,
    });
    setSelectedAvailability(availability);
  };

  const handleAvailabilityReset = () => {
    onUpdateCurrentQueryParams({
      pub_availableper: null,
    });
    setSelectedAvailability(null);
  };

  const handleServiceChange = services => {
    const params = {};
    const addPub = services.map(elm => `pub_${elm}`);

    allPubServicesKeys.forEach(key => {
      if (addPub.includes(key)) {
        // service is selected
        if (key === 'pub_cleaning_weekly') {
          params[key] = '1,2,3,4,5,6,7';
        } else {
          params[key] = 'yes';
        }
      } else {
        // service is not selected
        params[key] = null;
      }
    });

    onUpdateCurrentQueryParams(params);

    setSelectedServices(services);
  };

  const handleServiceReset = () => {
    const params = {};
    allPubServicesKeys.forEach(elm => {
      params[elm] = null;
    });
    onUpdateCurrentQueryParams(params);
    setSelectedServices([]);
  };

  const handlePropertyDetailChange = propertyDetail => {
    const param = {
      pub_living: null,
      pub_furnished: null,
    };

    if (Array.isArray(propertyDetail)) {
      const livingTypes = [];
      const furnishedTypes = [];

      propertyDetail.forEach(detail => {
        if (detail === 'open-livingroom') {
          livingTypes.push('open');
        } else if (detail === 'closed-livingroom') {
          livingTypes.push('closed');
        } else if (detail === 'furnished') {
          furnishedTypes.push('yes');
        } else if (detail === 'semi-furnished') {
          furnishedTypes.push('Semi');
        } else if (detail === 'unfurnished') {
          furnishedTypes.push('no');
        }
      });

      if (livingTypes.length > 0) {
        param.pub_living = livingTypes.join(',');
      }
      if (furnishedTypes.length > 0) {
        param.pub_furnished = furnishedTypes.join(',');
      }
    }

    onUpdateCurrentQueryParams(param);
    setSelectedPropertyDetail(propertyDetail);
  };

  const handlePropertyDetailReset = () => {
    onUpdateCurrentQueryParams({
      pub_living: null,
      pub_furnished: null,
    });
    setSelectedPropertyDetail([]);
  };

  const handleHostTypeChange = hostType => {
    onUpdateCurrentQueryParams({
      pub_agentorowner: hostType,
    });
    setSelectedHostType(hostType);
  };

  const handleHostTypeReset = () => {
    onUpdateCurrentQueryParams({
      pub_agentorowner: null,
    });
    setSelectedHostType(null);
  };

  const handleTenureChange = tenure => {
    onUpdateCurrentQueryParams({
      pub_Freehold: tenure,
    });
    setSelectedTenure(tenure);
  };

  const handleTenureReset = () => {
    onUpdateCurrentQueryParams({
      pub_Freehold: null,
    });
    setSelectedTenure(null);
  };

  const handleLandTitlesChange = landTitles => {
    onUpdateCurrentQueryParams({
      pub_landtitle: landTitles?.length > 0 ? landTitles.toString() : null,
    });
    setSelectedLandTitles(landTitles);
  };

  const handleLandTitlesReset = () => {
    onUpdateCurrentQueryParams({
      pub_landtitle: null,
    });
    setSelectedLandTitles([]);
  };

  const handleLandZonesChange = landZones => {
    onUpdateCurrentQueryParams({
      pub_landzone: landZones?.length > 0 ? landZones.toString() : null,
    });
    setSelectedLandZones(landZones);
  };

  const handleLandZonesReset = () => {
    onUpdateCurrentQueryParams({
      pub_landzone: null,
    });
    setSelectedLandZones([]);
  };

  const handleReset = () => {
    setSelectedCategory('rentalvillas');
    setSelectedLocation(null);
    setSelectedPeriod('weekly');
    setPriceRange([0, 50]);
    setSimplePriceRange([0, 1000]);
    setLandSizeRange([100, 1000]);
    setBedrooms(0);
    setBathrooms(0);
    setSelectedAmenities([]);
    setSelectedPropertyType(null);
    setSelectedAvailability(null);
    setSelectedServices([]);
    setSelectedPropertyDetail(null);
    setSelectedHostType(null);
    setSelectedTenure(null);
    setSelectedLandTitles([]);
    setSelectedLandZones([]);

    onReset();
    onClose();
  };

  return (
    <div className={css.container}>
      <div className={css.counterModalOverlay} onClick={onClose} />
      <div className={css.contentWrapper}>
        <div className={css.header}>
          <div className={css.spacer}></div>
          <h2 className={css.title}>
            <span className={css.filterIcon}>
              <IconCollection name="filter_icon" />
            </span>
            Filter
          </h2>
          <button onClick={onClose} className={css.closeButton}>
            <IconCollection name="close_icon" />
          </button>
        </div>

        <div className={css.content}>
          {/* Always visible filters */}
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            history={history}
          />
          <LocationSelector
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
            onReset={handleLocationReset}
          />

          {/* Dynamic filters based on category configuration */}
          {availableFilters.includes('price') && (
            <PriceSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
            />
          )}

          {availableFilters.includes('tenure') && (
            <TenureSelector
              selectedTenure={selectedTenure}
              onTenureChange={handleTenureChange}
              onReset={handleTenureReset}
            />
          )}

          {availableFilters.includes('landSize') && (
            <SimplePriceSelector
              priceRange={landSizeRange}
              onPriceRangeChange={handleLandSizeRangeChange}
              title="CustomFilter.LandSize.title"
              description="PriceFilter.landDescription"
              formatValue={value => `${value} m²`}
              min={100}
              max={50000}
              step={100}
              isSize={true}
            />
          )}

          {availableFilters.includes('simplePrice') && (
            <SimplePriceSelector
              priceRange={simplePriceRange}
              description="PriceFilter.simplePriceDescription"
              onPriceRangeChange={handleSimplePriceRangeChange}
              min={1000000}
              max={999000000000}
              step={5000000}
            />
          )}

          {availableFilters.includes('bedrooms') && (
            <BedroomsSelector
              bedrooms={bedrooms}
              onBedroomsChange={handleBedroomsChange}
              onReset={handleBedroomsReset}
            />
          )}

          {availableFilters.includes('bathrooms') && (
            <BathroomsSelector
              bathrooms={bathrooms}
              onBathroomsChange={handleBathroomsChange}
              onReset={handleBathroomsReset}
            />
          )}

          {availableFilters.includes('amenities') && (
            <AmenitiesSelector
              selectedAmenities={selectedAmenities}
              onAmenitiesChange={handleAmenitiesChange}
              onReset={handleAmenitiesReset}
              category={selectedCategory}
            />
          )}

          {availableFilters.includes('propertyType') && (
            <PropertyTypeSelector
              selectedPropertyType={selectedPropertyType}
              onPropertyTypeChange={handlePropertyTypeChange}
              onReset={handlePropertyTypeReset}
            />
          )}

          {availableFilters.includes('availability') && (
            <AvailabilitySelector
              selectedAvailability={selectedAvailability}
              onAvailabilityChange={handleAvailabilityChange}
              onReset={handleAvailabilityReset}
            />
          )}

          {availableFilters.includes('services') && (process.env.REACT_APP_DISPLAY_FILTER_SERVICES === 'true') && (
            <ServicesSelector
              selectedServices={selectedServices}
              onServiceChange={handleServiceChange}
              onReset={handleServiceReset}
            />
          )}

          {availableFilters.includes('propertyDetails') && (
            <PropertyDetailsSelector
              selectedPropertyDetail={selectedPropertyDetail}
              onPropertyDetailChange={handlePropertyDetailChange}
              onReset={handlePropertyDetailReset}
            />
          )}

          {availableFilters.includes('landTitle') && (
            <LandTitleSelector
              selectedLandTitles={selectedLandTitles}
              onLandTitlesChange={handleLandTitlesChange}
              onReset={handleLandTitlesReset}
            />
          )}

          {availableFilters.includes('landZone') && (
            <LandZoneSelector
              selectedLandZones={selectedLandZones}
              onLandZonesChange={handleLandZonesChange}
              onReset={handleLandZonesReset}
            />
          )}

          {availableFilters.includes('hostType') && (
            <HostTypeSelector
              selectedHostType={selectedHostType}
              onHostTypeChange={handleHostTypeChange}
              onReset={handleHostTypeReset}
            />
          )}
        </div>

        <div className={css.footer}>
          <button onClick={handleReset} className={css.resetButton}>
            Reset All
          </button>
          <button onClick={onClose} className={css.showListingsButton}>
            <FormattedMessage id="CustomFilters.showListingsButton" values={{ resultsCount }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomFilters;
