import React, { useState } from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import { FormattedMessage } from '../../../../../util/reactIntl';

import { OutsideClickHandler, RangeSlider } from '../../../../../components';

import css from './FilterLandSize.module.css';
import IconCollection from '../../../../../components/IconCollection/IconCollection';

const formatLandSize = size => {
  return `${size} m2`;
};

const LandSizeDropdown = ({
  input,
  className,
  rootClassName,
  alignLeft,
  isOpen,
  setIsOpen,
  setIsOpenPrice,
}) => {
  const [landSizeRange, setLandSizeRange] = useState([100, 50000]);

  // Add separate state for input values to allow intermediate editing
  const [minInputValue, setMinInputValue] = useState(100);
  const [maxInputValue, setMaxInputValue] = useState(50000);
  const [isRangeChanging, setIsRangeChanging] = useState(false);

  // Update input values when landSizeRange changes (e.g., from slider)
  // But don't interfere when range is changing programmatically
  React.useEffect(() => {
    if (!isRangeChanging) {
      setMinInputValue(landSizeRange[0]);
      setMaxInputValue(landSizeRange[1]);
    }
  }, [landSizeRange, isRangeChanging]);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setIsOpenPrice(true);
  };

  const handleRangeChange = handles => {
    setIsRangeChanging(true);
    setLandSizeRange(handles);
    // Update the form value with the range
    input.onChange({
      minSize: handles[0],
      maxSize: handles[1],
    });

    // Reset the flag after a brief delay to allow the change to complete
    setTimeout(() => {
      setIsRangeChanging(false);
    }, 100);
  };

  const handleMinInputChange = e => {
    const inputValue = e.target.value;

    // Prevent typing values beyond absolute max limit (50000)
    if (inputValue !== '' && !isNaN(inputValue)) {
      const numValue = parseInt(inputValue);
      if (numValue > 50000) {
        return; // Don't update input if beyond max limit
      }
    }

    setMinInputValue(inputValue);

    // Only update the range if we have a valid number and it's within absolute limits
    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = parseInt(inputValue);

      // Validate against absolute limits (100-50000) and current max
      if (value >= 100 && value <= 50000 && value <= landSizeRange[1]) {
        const newRange = [value, landSizeRange[1]];
        setLandSizeRange(newRange);
        handleRangeChange(newRange);
      }
    }
  };

  const handleMaxInputChange = e => {
    const inputValue = e.target.value;

    // Prevent typing values beyond absolute max limit (50000)
    if (inputValue !== '' && !isNaN(inputValue)) {
      const numValue = parseInt(inputValue);
      if (numValue > 50000) {
        return; // Don't update input if beyond max limit
      }
    }

    setMaxInputValue(inputValue);

    // Only update the range if we have a valid number and it's within absolute limits
    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = parseInt(inputValue);

      // Validate against absolute limits (100-50000) and current min
      if (value <= 50000 && value >= 100 && value >= landSizeRange[0]) {
        const newRange = [landSizeRange[0], value];
        setLandSizeRange(newRange);
        handleRangeChange(newRange);
      }
    }
  };

  // Add blur handlers to apply final validation
  const handleMinInputBlur = e => {
    const inputValue = e.target.value;
    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = parseInt(inputValue);
      const clampedValue = Math.max(100, Math.min(value, landSizeRange[1]));

      if (clampedValue !== value) {
        // Update input display to show clamped value
        setMinInputValue(clampedValue);
        const newRange = [clampedValue, landSizeRange[1]];
        setLandSizeRange(newRange);
        handleRangeChange(newRange);
      }
    } else if (inputValue === '') {
      // If empty on blur, reset to current range value
      setMinInputValue(landSizeRange[0]);
    }
  };

  const handleMaxInputBlur = e => {
    const inputValue = e.target.value;
    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = parseInt(inputValue);
      const clampedValue = Math.min(50000, Math.max(value, landSizeRange[0]));

      if (clampedValue !== value) {
        // Update input display to show clamped value
        setMaxInputValue(clampedValue);
        const newRange = [landSizeRange[0], clampedValue];
        setLandSizeRange(newRange);
        handleRangeChange(newRange);
      }
    } else if (inputValue === '') {
      // If empty on blur, reset to current range value
      setMaxInputValue(landSizeRange[1]);
    }
  };

  const getCurrentValue = () => {
    if (input.value && landSizeRange.length > 0) {
      return `${formatLandSize(landSizeRange[0])} - ${formatLandSize(landSizeRange[1])}`;
    }
    return null;
  };

  const labelText = getCurrentValue() || (
    <FormattedMessage id="PageBuilder.SearchCTA.LandSizeFilter.placeholder" />
  );

  const rootClass = rootClassName || css.root;
  const classes = classNames(rootClass, className);

  return (
    <OutsideClickHandler className={classes} onOutsideClick={() => setIsOpen(false)}>
      <div className={css.dropdownContainer}>
        <div
          role="button"
          tabIndex={0}
          onClick={toggleDropdown}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleDropdown();
            }
          }}
          className={classNames(css.toggleButton, {
            [css.unselected]: !getCurrentValue() && !isOpen,
            [css.selected]: getCurrentValue(),
            [css.opened]: isOpen,
          })}
        >
          <span className={css.landSizeIcon}>
            <IconCollection name="land_icon" />
          </span>
          <div className={css.dropdownText}>
            <span className={css.mainLabel}>
              <FormattedMessage id="PageBuilder.SearchCTA.LandSizeFilter.mainLabel" />
            </span>
            <span className={css.subLabel}>{labelText}</span>
          </div>
          {/* <span className={classNames(css.chevron, isOpen && css.isOpen)} /> */}
        </div>

        {isOpen && (
          <div
            className={classNames(css.dropdownContent, {
              [css.alignLeft]: alignLeft,
            })}
          >
            <div className={css.counterModalOverlay} onClick={() => setIsOpen(false)} />
            <div className={css.landSizeModal}>
              <div className={css.menuItemMobile}>
                <h2 className={css.menuItemMobileTitle}>
                  <span className={css.menuItemMobileTitleIcon}>
                    <svg
                      width="18"
                      height="19"
                      viewBox="0 0 18 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.8455 4.04352L14.4565 0.654459C14.2506 0.448514 13.9167 0.448514 13.7107 0.654459L12.389 1.97616L13.5186 3.10576C13.7246 3.31178 13.7246 3.64576 13.5186 3.85143C13.313 4.05744 12.979 4.05744 12.773 3.85143L11.6433 2.72182L10.6945 3.67069L10.6945 3.67072L11.2595 4.23533C11.4651 4.44135 11.4651 4.77533 11.2595 4.98135C11.0535 5.18737 10.7195 5.18701 10.5135 4.98135L9.94871 4.41642L8.99991 5.36522L10.1295 6.49483C10.3355 6.70084 10.3355 7.03483 10.1295 7.24049C9.92385 7.44651 9.58987 7.44651 9.38385 7.24049L8.25425 6.11088L7.30549 7.05965L7.87041 7.6244C8.07608 7.83041 8.07608 8.1644 7.87041 8.37041C7.6644 8.57643 7.33041 8.57608 7.1244 8.37041L6.55965 7.80549L5.61088 8.75425L6.74049 9.88385C6.94651 10.0899 6.94651 10.4239 6.74049 10.6295C6.53483 10.8355 6.20084 10.8355 5.99483 10.6295L4.86522 9.49991L3.91649 10.4486L4.48138 11.0134C4.68705 11.2194 4.68705 11.5534 4.48138 11.7594C4.27537 11.9655 3.94138 11.9651 3.73537 11.7594L3.17058 11.1945L2.22175 12.1434L3.35143 13.273C3.55744 13.479 3.55744 13.813 3.35143 14.0186C3.14576 14.2246 2.81178 14.2246 2.60576 14.0186L1.47623 12.8889L0.154459 14.2107C-0.0514863 14.4167 -0.0514863 14.7505 0.154459 14.9565L3.54352 18.3455C3.64649 18.4485 3.78146 18.5 3.91639 18.5C4.05132 18.5 4.18632 18.4485 4.28926 18.3455L17.8455 4.78929C18.0515 4.58335 18.0515 4.24947 17.8455 4.04352Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M17.8455 4.04352L14.4565 0.654459C14.2506 0.448514 13.9167 0.448514 13.7107 0.654459L12.389 1.97616L13.5186 3.10576C13.7246 3.31178 13.7246 3.64576 13.5186 3.85143C13.313 4.05744 12.979 4.05744 12.773 3.85143L11.6433 2.72182L10.6945 3.67069L10.6945 3.67072L11.2595 4.23533C11.4651 4.44135 11.4651 4.77533 11.2595 4.98135C11.0535 5.18737 10.7195 5.18701 10.5135 4.98135L9.94871 4.41642L8.99991 5.36522L10.1295 6.49483C10.3355 6.70084 10.3355 7.03483 10.1295 7.24049C9.92385 7.44651 9.58987 7.44651 9.38385 7.24049L8.25425 6.11088L7.30549 7.05965L7.87041 7.6244C8.07608 7.83041 8.07608 8.1644 7.87041 8.37041C7.6644 8.57643 7.33041 8.57608 7.1244 8.37041L6.55965 7.80549L5.61088 8.75425L6.74049 9.88385C6.94651 10.0899 6.94651 10.4239 6.74049 10.6295C6.53483 10.8355 6.20084 10.8355 5.99483 10.6295L4.86522 9.49991L3.91649 10.4486L4.48138 11.0134C4.68705 11.2194 4.68705 11.5534 4.48138 11.7594C4.27537 11.9655 3.94138 11.9651 3.73537 11.7594L3.17058 11.1945L2.22175 12.1434L3.35143 13.273C3.55744 13.479 3.55744 13.813 3.35143 14.0186C3.14576 14.2246 2.81178 14.2246 2.60576 14.0186L1.47623 12.8889L0.154459 14.2107C-0.0514863 14.4167 -0.0514863 14.7505 0.154459 14.9565L3.54352 18.3455C3.64649 18.4485 3.78146 18.5 3.91639 18.5C4.05132 18.5 4.18632 18.4485 4.28926 18.3455L17.8455 4.78929C18.0515 4.58335 18.0515 4.24947 17.8455 4.04352Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                    </svg>
                  </span>
                  Land Size
                </h2>
                <p className={css.menuItemMobileSubtitle}>Select a land size range (in m2)</p>
                <span className={css.closeIcon} onClick={() => setIsOpen(false)}>
                  <IconCollection name="close_icon" />
                </span>
              </div>
              {/* Land Size Range Slider */}
              <div className={css.sliderSection}>
                <p className={css.menuItemSubtitle}>Select a land size range (in m2)</p>
                <div className={css.sliderWrapper}>
                  <RangeSlider
                    min={100}
                    max={50000}
                    step={100}
                    handles={landSizeRange}
                    onChange={handleRangeChange}
                  />
                </div>

                {/* Min/Max Values */}
                <div className={css.priceValues}>
                  <div className={css.priceValue}>
                    <span className={css.priceLabel}>
                      <FormattedMessage id="PageBuilder.SearchCTA.LandSizeFilter.minimum" />
                    </span>
                    <input
                      type="number"
                      className={css.priceAmount}
                      value={minInputValue}
                      onChange={handleMinInputChange}
                      onBlur={handleMinInputBlur}
                      min={100}
                      max={50000}
                      step={100}
                    />
                  </div>
                  <div className={css.priceValue}>
                    <span className={css.priceLabel}>
                      <FormattedMessage id="PageBuilder.SearchCTA.LandSizeFilter.maximum" />
                    </span>
                    <input
                      type="number"
                      className={css.priceAmount}
                      value={maxInputValue}
                      onChange={handleMaxInputChange}
                      onBlur={handleMaxInputBlur}
                      min={100}
                      max={50000}
                      step={100}
                    />
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className={css.nextButtonContainer}>
                <button type="button" className={css.nextButton} onClick={closeDropdown}>
                  <FormattedMessage id="PageBuilder.SearchCTA.LandSizeFilter.nextButton" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

// Final Form wrapper
const FilterLandSize = props => {
  const { className, rootClassName, ...rest } = props;
  return (
    <Field
      {...rest}
      name="pub_landSize"
      component={LandSizeDropdown}
      className={className}
      rootClassName={rootClassName}
    />
  );
};

export default FilterLandSize;
