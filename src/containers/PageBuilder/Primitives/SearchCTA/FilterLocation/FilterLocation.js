import React, { useRef, useState } from 'react';
import { Field } from 'react-final-form';
import { useIntl } from '../../../../../util/reactIntl';
import classNames from 'classnames';

import { IconLocation } from '../../../../../components';
import LocationAutocompleteInput from '../../../../../components/LocationAutocompleteInput/LocationAutocompleteInput';
import css from './FilterLocation.module.css';

const identity = v => v;

const LocationSearchField = props => {
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const {
    inputRootClass,
    intl,
    inputRef,
    onLocationChange,
    alignLeft,
    Searchicon,
    showCrossIcon,
    onNext,
  } = props;
  return (
    <Field
      name="location"
      format={identity}
      render={({ input, meta }) => {
        const { onChange, ...restInput } = input;
        const searchOnChange = value => {
          onChange(value);
          onLocationChange(value);
          if (value?.selectedPlace && value.selectedPlace.address == '') {
            setIsCurrentLocation(true);
          } else {
            setIsCurrentLocation(false);
          }
        };

        return (
          <LocationAutocompleteInput
            className={css.customField}
            useDarkText={true}
            inputClassName={isCurrentLocation ? css.inputWithCurrentLocation : inputRootClass}
            closeOnBlur={true}
            predictionsClassName={classNames(css.predictions, {
              [css.alignLeft]: alignLeft,
            })}
            CustomIcon={IconLocation}
            iconClassName={css.locationAutocompleteInputIcon}
            isCurrentLocation={isCurrentLocation}
            placeholder={
              isCurrentLocation
                ? intl.formatMessage({ id: 'PageBuilder.SearchCTA.currentLocationPlaceholder' })
                : intl.formatMessage({ id: 'PageBuilder.SearchCTA.locationPlaceholder' })
            }
            inputRef={inputRef}
            input={{ ...restInput, onChange: searchOnChange }}
            meta={meta}
            Searchicon={Searchicon}
            showCrossIcon={showCrossIcon}
            onNext={onNext}
          />
        );
      }}
    />
  );
};

const FilterLocation = props => {
  const searchInpuRef = useRef(null);
  const intl = useIntl();
  const {
    appConfig,
    onSubmit,
    setSubmitDisabled,
    className,
    rootClassName,
    alignLeft,
    isCurrentLocation,
    Searchicon,
    setIsOpenBedrooms = () => {},
    setIsOpenLandSize = () => {},
    landSize,
    isMobile,
    onUpdateLocationSelector = () => {},
    ...restOfProps
  } = props;
  const classes = classNames(rootClassName || css.root, className);

  const onChange = location => {
    if (onUpdateLocationSelector && location?.selectedPlace) {
      onUpdateLocationSelector(location);
    }

    if (location?.search?.length > 0 && !location?.selectedPlace) {
      setSubmitDisabled(true);
    } else if (location?.name === 'location') {
      if (landSize) {
        setIsOpenLandSize(true);
      } else {
        setIsOpenBedrooms(true);
      }
    } else {
      setSubmitDisabled(false);

      if (location.search === '') {
        return;
      }

      if (landSize) {
        setIsOpenLandSize(true);
      } else {
        setIsOpenBedrooms(true);
      }
    }
  };

  return (
    <div className={classes}>
      <LocationSearchField
        inputRootClass={css.input}
        intl={intl}
        inputRef={searchInpuRef}
        onLocationChange={onChange}
        alignLeft={alignLeft}
        Searchicon={Searchicon}
        showCrossIcon={true}
        onNext={() => {
          if (landSize) {
            setIsOpenLandSize(true);
          } else {
            setIsOpenBedrooms(true);
          }
        }}
      />
    </div>
  );
};
export default FilterLocation;
