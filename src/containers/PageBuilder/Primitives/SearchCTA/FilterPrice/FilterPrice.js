import React, { useEffect, useState } from 'react';
import { Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { FormattedMessage } from '../../../../../util/reactIntl';

import { OutsideClickHandler, RangeSlider } from '../../../../../components';
import IconCollection from '../../../../../components/IconCollection/IconCollection';

import css from './FilterPrice.module.css';

const tabs = [
  { id: 'weekly', label: <FormattedMessage id="PageBuilder.SearchCTA.PriceFilter.weekly" /> },
  { id: 'monthly', label: <FormattedMessage id="PageBuilder.SearchCTA.PriceFilter.monthly" /> },
  { id: 'yearly', label: <FormattedMessage id="PageBuilder.SearchCTA.PriceFilter.yearly" /> },
];

const getRangeConfig = tabId => {
  const configs = {
    weekly: { min: 1000000, max: 150000000, step: 1000000 }, // 1M-150M
    monthly: { min: 1000000, max: 500000000, step: 1000000 }, // 1M-500M
    yearly: { min: 50000000, max: 5000000000, step: 50000000 }, // 50M-5000M
  };
  return configs[tabId] || configs.monthly;
};

const getNonRentalConfig = () => {
  return { min: 1000000, max: 999000000000, step: 1000000 }; // 1M-9999000M
};

const toDisplayValue = (value, currency, conversionRate) => {
  if (currency === 'IDR') {
    return value / 1000000;
  }
  return Math.round(value * conversionRate);
};

const fromDisplayValue = (value, currency, conversionRate) => {
  if (currency === 'IDR') {
    return value * 1000000;
  }
  return value / conversionRate;
};

const PriceDropdown = ({
  input,
  className,
  rootClassName,
  alignLeft,
  activeTabKey,
  isOpen,
  setIsOpen,
}) => {
  const USDConversionRate = useSelector(state => state.currency.conversionRate?.USD);
  const currency = useSelector(state => state.currency.selectedCurrency);

  const [activeTab, setActiveTab] = useState('monthly');
  const showTabsInPrice = activeTabKey === 'rentalvillas';

  const getInitialConfig = () => {
    if (showTabsInPrice) {
      return getRangeConfig('monthly');
    }
    return getNonRentalConfig();
  };

  const initialConfig = getInitialConfig();
  const [priceRange, setPriceRange] = useState([initialConfig.min, initialConfig.max]);

  const [minInputValue, setMinInputValue] = useState(
    toDisplayValue(initialConfig.min, currency, USDConversionRate)
  );
  const [maxInputValue, setMaxInputValue] = useState(
    toDisplayValue(initialConfig.max, currency, USDConversionRate)
  );
  const [isTabChanging, setIsTabChanging] = useState(false);

  useEffect(() => {
    const config = showTabsInPrice ? getRangeConfig('monthly') : getNonRentalConfig();
    setPriceRange([config.min, config.max]);
    setMinInputValue(toDisplayValue(config.min, currency, USDConversionRate));
    setMaxInputValue(toDisplayValue(config.max, currency, USDConversionRate));
  }, [showTabsInPrice, currency, USDConversionRate]);

  useEffect(() => {
    if (!isTabChanging) {
      setMinInputValue(toDisplayValue(priceRange[0], currency, USDConversionRate));
      setMaxInputValue(toDisplayValue(priceRange[1], currency, USDConversionRate));
    }
  }, [priceRange, isTabChanging, currency, USDConversionRate]);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleTabChange = tab => {
    setIsTabChanging(true);
    setActiveTab(tab);
    const config = getRangeConfig(tab);
    const newRange = [config.min, config.max];
    setPriceRange(newRange);
    setMinInputValue(toDisplayValue(config.min, currency, USDConversionRate));
    setMaxInputValue(toDisplayValue(config.max, currency, USDConversionRate));
    handleRangeChange(newRange);

    setTimeout(() => {
      setIsTabChanging(false);
    }, 100);
  };

  const handleRangeChange = handles => {
    setPriceRange(handles);
    input.onChange({
      period: activeTab,
      minPrice: handles[0],
      maxPrice: handles[1],
    });
  };

  const handleMinInputChange = e => {
    const inputValue = e.target.value;
    const config = showTabsInPrice ? getRangeConfig(activeTab) : getNonRentalConfig();

    if (inputValue !== '' && !isNaN(inputValue)) {
      const numValue = parseFloat(inputValue);
      if (numValue > toDisplayValue(config.max, currency, USDConversionRate)) {
        return;
      }
    }

    setMinInputValue(inputValue);

    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = fromDisplayValue(parseFloat(inputValue), currency, USDConversionRate);

      if (value >= config.min && value <= config.max && value <= priceRange[1]) {
        const newRange = [value, priceRange[1]];
        setPriceRange(newRange);
        handleRangeChange(newRange);
      }
    }
  };

  const handleMaxInputChange = e => {
    const inputValue = e.target.value;
    const config = showTabsInPrice ? getRangeConfig(activeTab) : getNonRentalConfig();

    if (inputValue !== '' && !isNaN(inputValue)) {
      const numValue = parseFloat(inputValue);
      if (numValue > toDisplayValue(config.max, currency, USDConversionRate)) {
        return;
      }
    }

    setMaxInputValue(inputValue);

    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = fromDisplayValue(parseFloat(inputValue), currency, USDConversionRate);

      if (value <= config.max && value >= config.min && value >= priceRange[0]) {
        const newRange = [priceRange[0], value];
        setPriceRange(newRange);
        handleRangeChange(newRange);
      }
    }
  };

  const handleMinInputBlur = e => {
    const inputValue = e.target.value;
    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = fromDisplayValue(parseFloat(inputValue), currency, USDConversionRate);
      const config = showTabsInPrice ? getRangeConfig(activeTab) : getNonRentalConfig();
      const clampedValue = Math.max(config.min, Math.min(value, priceRange[1]));

      if (clampedValue !== value) {
        setMinInputValue(toDisplayValue(clampedValue, currency, USDConversionRate));
        const newRange = [clampedValue, priceRange[1]];
        setPriceRange(newRange);
        handleRangeChange(newRange);
      }
    }
  };

  const handleMaxInputBlur = e => {
    const inputValue = e.target.value;
    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = fromDisplayValue(parseFloat(inputValue), currency, USDConversionRate);
      const config = showTabsInPrice ? getRangeConfig(activeTab) : getNonRentalConfig();
      const clampedValue = Math.min(config.max, Math.max(value, priceRange[0]));

      if (clampedValue !== value) {
        setMaxInputValue(toDisplayValue(clampedValue, currency, USDConversionRate));
        const newRange = [priceRange[0], clampedValue];
        setPriceRange(newRange);
        handleRangeChange(newRange);
      }
    }
  };

  const formatPrice = (price, currency, conversionRate) => {
    const displayValue = toDisplayValue(price, currency, conversionRate);
    if (currency === 'IDR') {
      return `${displayValue}M`;
    }
    return `$${displayValue.toLocaleString('en-US')}`;
  };

  const getCurrentValue = () => {
    if (input.value && priceRange.length > 0) {
      return `${formatPrice(priceRange[0] || 0, currency, USDConversionRate)} - ${formatPrice(
        priceRange[1],
        currency,
        USDConversionRate
      )}`;
    }
    return null;
  };

  const labelText = getCurrentValue() || (
    <FormattedMessage id="PageBuilder.SearchCTA.PriceFilter.placeholder" />
  );

  const rootClass = rootClassName || css.root;
  const classes = classNames(rootClass, className);

  const priceUnit = currency === 'IDR' ? '(in millions IDR)' : '(in USD)';

  const config = showTabsInPrice ? getRangeConfig(activeTab) : getNonRentalConfig();
  const displayConfig = {
    min: toDisplayValue(config.min, currency, USDConversionRate),
    max: toDisplayValue(config.max, currency, USDConversionRate),
    step: currency === 'IDR' ? config.step / 1000000 : 10,
  };

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
          <span className={css.priceIcon}>
            <IconCollection name="area_icon" />
          </span>
          <div className={css.dropdownText}>
            <span className={css.mainLabel}>
              <FormattedMessage id="PageBuilder.SearchCTA.PriceFilter.mainLabel" />
            </span>
            <span className={css.subLabel}>{labelText}</span>
          </div>
        </div>

        {isOpen && (
          <div
            className={classNames(css.dropdownContent, {
              [css.alignLeft]: alignLeft,
            })}
          >
            <div className={css.counterModalOverlay} onClick={closeDropdown} />
            <div className={css.priceModal}>
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
                        d="M9 6.125C8.55245 6.125 8.12323 6.30279 7.80676 6.61926C7.49029 6.93573 7.3125 7.36495 7.3125 7.8125C7.3125 8.26005 7.49029 8.68928 7.80676 9.00574C8.12323 9.32221 8.55245 9.5 9 9.5C9.44755 9.5 9.87678 9.32221 10.1932 9.00574C10.5097 8.68928 10.6875 8.26005 10.6875 7.8125C10.6875 7.36495 10.5097 6.93573 10.1932 6.61926C9.87678 6.30279 9.44755 6.125 9 6.125Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M9 6.125C8.55245 6.125 8.12323 6.30279 7.80676 6.61926C7.49029 6.93573 7.3125 7.36495 7.3125 7.8125C7.3125 8.26005 7.49029 8.68928 7.80676 9.00574C8.12323 9.32221 8.55245 9.5 9 9.5C9.44755 9.5 9.87678 9.32221 10.1932 9.00574C10.5097 8.68928 10.6875 8.26005 10.6875 7.8125C10.6875 7.36495 10.5097 6.93573 10.1932 6.61926C9.87678 6.30279 9.44755 6.125 9 6.125Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M1.125 4.15625C1.125 3.37925 1.755 2.75 2.53125 2.75H15.4688C16.245 2.75 16.875 3.38 16.875 4.15625V11.4688C16.875 12.2458 16.245 12.875 15.4688 12.875H2.53125C2.34658 12.875 2.16372 12.8386 1.9931 12.768C1.82249 12.6973 1.66746 12.5937 1.53688 12.4631C1.4063 12.3325 1.30272 12.1775 1.23204 12.0069C1.16137 11.8363 1.125 11.6534 1.125 11.4688V4.15625ZM6.1875 7.8125C6.1875 7.06658 6.48382 6.35121 7.01126 5.82376C7.53871 5.29632 8.25408 5 9 5C9.74592 5 10.4613 5.29632 10.9887 5.82376C11.5162 6.35121 11.8125 7.06658 11.8125 7.8125C11.8125 8.55842 11.5162 9.27379 10.9887 9.80124C10.4613 10.3287 9.74592 10.625 9 10.625C8.25408 10.625 7.53871 10.3287 7.01126 9.80124C6.48382 9.27379 6.1875 8.55842 6.1875 7.8125ZM14.0625 7.25C13.9133 7.25 13.7702 7.30926 13.6648 7.41475C13.5593 7.52024 13.5 7.66332 13.5 7.8125V7.8185C13.5 8.129 13.752 8.381 14.0625 8.381H14.0685C14.2177 8.381 14.3608 8.32174 14.4662 8.21625C14.5717 8.11076 14.631 7.96768 14.631 7.8185V7.8125C14.631 7.66332 14.5717 7.52024 14.4662 7.41475C14.3608 7.30926 14.2177 7.25 14.0685 7.25H14.0625ZM3.375 7.8125C3.375 7.66332 3.43426 7.52024 3.53975 7.41475C3.64524 7.30926 3.78832 7.25 3.9375 7.25H3.9435C4.09268 7.25 4.23576 7.30926 4.34125 7.41475C4.44674 7.52024 4.506 7.66332 4.506 7.8125V7.8185C4.506 7.96768 4.44674 8.11076 4.34125 8.21625C4.23576 8.32174 4.09268 8.381 3.9435 8.381H3.9375C3.78832 8.381 3.64524 8.32174 3.53975 8.21625C3.43426 8.11076 3.375 7.96768 3.375 7.8185V7.8125Z"
                        fill="#4D4D4D"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M1.125 4.15625C1.125 3.37925 1.755 2.75 2.53125 2.75H15.4688C16.245 2.75 16.875 3.38 16.875 4.15625V11.4688C16.875 12.2458 16.245 12.875 15.4688 12.875H2.53125C2.34658 12.875 2.16372 12.8386 1.9931 12.768C1.82249 12.6973 1.66746 12.5937 1.53688 12.4631C1.4063 12.3325 1.30272 12.1775 1.23204 12.0069C1.16137 11.8363 1.125 11.6534 1.125 11.4688V4.15625ZM6.1875 7.8125C6.1875 7.06658 6.48382 6.35121 7.01126 5.82376C7.53871 5.29632 8.25408 5 9 5C9.74592 5 10.4613 5.29632 10.9887 5.82376C11.5162 6.35121 11.8125 7.06658 11.8125 7.8125C11.8125 8.55842 11.5162 9.27379 10.9887 9.80124C10.4613 10.3287 9.74592 10.625 9 10.625C8.25408 10.625 7.53871 10.3287 7.01126 9.80124C6.48382 9.27379 6.1875 8.55842 6.1875 7.8125ZM14.0625 7.25C13.9133 7.25 13.7702 7.30926 13.6648 7.41475C13.5593 7.52024 13.5 7.66332 13.5 7.8125V7.8185C13.5 8.129 13.752 8.381 14.0625 8.381H14.0685C14.2177 8.381 14.3608 8.32174 14.4662 8.21625C14.5717 8.11076 14.631 7.96768 14.631 7.8185V7.8125C14.631 7.66332 14.5717 7.52024 14.4662 7.41475C14.3608 7.30926 14.2177 7.25 14.0685 7.25H14.0625ZM3.375 7.8125C3.375 7.66332 3.43426 7.52024 3.53975 7.41475C3.64524 7.30926 3.78832 7.25 3.9375 7.25H3.9435C4.09268 7.25 4.23576 7.30926 4.34125 7.41475C4.44674 7.52024 4.506 7.66332 4.506 7.8125V7.8185C4.506 7.96768 4.44674 8.11076 4.34125 8.21625C4.23576 8.32174 4.09268 8.381 3.9435 8.381H3.9375C3.78832 8.381 3.64524 8.32174 3.53975 8.21625C3.43426 8.11076 3.375 7.96768 3.375 7.8185V7.8125Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                      <path
                        d="M1.6875 14C1.53832 14 1.39524 14.0593 1.28975 14.1648C1.18426 14.2702 1.125 14.4133 1.125 14.5625C1.125 14.7117 1.18426 14.8548 1.28975 14.9602C1.39524 15.0657 1.53832 15.125 1.6875 15.125C5.7375 15.125 9.66 15.6665 13.3875 16.6813C14.28 16.9243 15.1875 16.2627 15.1875 15.3162V14.5625C15.1875 14.4133 15.1282 14.2702 15.0227 14.1648C14.9173 14.0593 14.7742 14 14.625 14H1.6875Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M1.6875 14C1.53832 14 1.39524 14.0593 1.28975 14.1648C1.18426 14.2702 1.125 14.4133 1.125 14.5625C1.125 14.7117 1.18426 14.8548 1.28975 14.9602C1.39524 15.0657 1.53832 15.125 1.6875 15.125C5.7375 15.125 9.66 15.6665 13.3875 16.6813C14.28 16.9243 15.1875 16.2627 15.1875 15.3162V14.5625C15.1875 14.4133 15.1282 14.2702 15.0227 14.1648C14.9173 14.0593 14.7742 14 14.625 14H1.6875Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                    </svg>
                  </span>
                  Price
                </h2>
                <p className={css.menuItemMobileSubtitle}>
                  {showTabsInPrice
                    ? `Select a price range per week, month or year ${priceUnit}`
                    : `Select your price range ${priceUnit}`}
                </p>
                <span className={css.closeIcon} onClick={closeDropdown}>
                  <IconCollection name="close_icon" />
                </span>
              </div>
              {showTabsInPrice && (
                <div className={css.tabsContainer}>
                  <div className={css.tabsWrapper}>
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        className={classNames(css.tab, {
                          [css.activeTab]: activeTab === tab.id,
                        })}
                      >
                        {tab.label}
                      </button>
                    ))}
                    <div
                      className={css.tabIndicator}
                      style={{
                        transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div
                className={classNames(css.sliderSection, {
                  [css.sliderSectionNoTabs]: !showTabsInPrice,
                })}
              >
                <p className={css.menuItemSubtitle}>
                  {showTabsInPrice
                    ? `Select a price range per week, month or year ${priceUnit}`
                    : `Select your price range ${priceUnit}`}
                </p>
                <div className={css.sliderWrapper}>
                  <RangeSlider
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    handles={priceRange}
                    onChange={handleRangeChange}
                  />
                </div>

                <div className={css.priceValues}>
                  <div className={css.priceValue}>
                    <span className={css.priceLabel}>
                      <FormattedMessage id="PageBuilder.SearchCTA.PriceFilter.minimum" />
                    </span>
                    <input
                      type="number"
                      className={css.priceAmount}
                      value={minInputValue}
                      onChange={handleMinInputChange}
                      onBlur={handleMinInputBlur}
                      min={displayConfig.min}
                      max={displayConfig.max}
                      step={displayConfig.step}
                    />
                  </div>
                  <div className={css.priceValue}>
                    <span className={css.priceLabel}>
                      <FormattedMessage id="PageBuilder.SearchCTA.PriceFilter.maximum" />
                    </span>
                    <input
                      type="number"
                      className={css.priceAmount}
                      value={maxInputValue}
                      onChange={handleMaxInputChange}
                      onBlur={handleMaxInputBlur}
                      min={displayConfig.min}
                      max={displayConfig.max}
                      step={displayConfig.step}
                    />
                  </div>
                </div>
              </div>

              {true && (
                <div className={css.showButtonContainer}>
                  <button type="button" className={css.showButton} onClick={closeDropdown}>
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

const FilterPrice = props => {
  const { className, rootClassName, form, ...rest } = props;
  return (
    <Field
      {...rest}
      name="pub_price"
      component={PriceDropdown}
      className={className}
      rootClassName={rootClassName}
    />
  );
};

export default FilterPrice;
