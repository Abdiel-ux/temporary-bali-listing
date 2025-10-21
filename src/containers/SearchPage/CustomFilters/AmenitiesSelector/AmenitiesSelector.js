import React from 'react';
import css from './AmenitiesSelector.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import { FormattedMessage } from 'react-intl';

const rentalAmenities = [
  { icon: <IconCollection name="wifi" />, label: 'ListingPage.customListingField.wifi', id: 'wifi' },
  { icon: <IconCollection name="pool" />, label: 'ListingPage.customListingField.pool', id: 'pool' },
  { icon: <IconCollection name="gym" />, label: 'ListingPage.customListingField.gym', id: 'gym' },
  { icon: <IconCollection name="pet" />, label: 'ListingPage.customListingField.petFriendly', id: 'petfriendly' },
  { icon: <IconCollection name="desk" />, label: 'ListingPage.customListingField.workingDesk', id: 'workingdesk' },
  { icon: <IconCollection name="parking" />, label: 'ListingPage.customListingField.carParking', id: 'carparking' },
  { icon: <IconCollection name="kitchen" />, label: 'ListingPage.customListingField.kitchen', id: 'kitchen' },
  { icon: <IconCollection name="aircondition" />, label: 'ListingPage.customListingField.airconditioning', id: 'airco' },
];

const villaAmenities = [
  { icon: <IconCollection name="pool" />, label: 'ListingPage.customListingField.pool', id: 'pool' },
  { icon: <IconCollection name="gym" />, label: 'ListingPage.customListingField.gym', id: 'gym' },
  { icon: <IconCollection name="parking" />, label: 'ListingPage.customListingField.carParking', id: 'carparking' },
];

function AmenitiesSelector({ selectedAmenities = [], onAmenitiesChange, onReset, category }) {
  const amenities = category === 'rentalvillas' ? rentalAmenities : villaAmenities;
  const handleAmenityToggle = amenityId => {
    const newSelectedAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId];

    onAmenitiesChange(newSelectedAmenities);
  };

  const handleReset = () => {
    onAmenitiesChange([]);
    onReset();
  };

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h3 className={css.title}>
          <FormattedMessage id="CustomFilter.Amenities.title" />
        </h3>
        <button onClick={handleReset} className={css.resetButton}>
          Reset
        </button>
      </div>

      <div className={css.amenitiesGrid}>
        {amenities.map(amenity => (
          <button
            key={amenity.id}
            className={`${css.amenityPill} ${
              selectedAmenities.includes(amenity.id) ? css.selected : ''
            }`}
            onClick={() => handleAmenityToggle(amenity.id)}
          >
            <span className={css.amenityIcon}>{amenity.icon}</span>
            <span className={css.amenityName}><FormattedMessage id={amenity.label} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AmenitiesSelector;
