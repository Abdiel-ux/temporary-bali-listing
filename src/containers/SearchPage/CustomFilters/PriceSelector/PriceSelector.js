import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RangeSlider } from '../../../../components';
import css from './PriceSelector.module.css';
import { FormattedMessage } from 'react-intl';

const tabs = [
  { id: 'weekly', label: 'PageBuilder.SearchCTA.PriceFilter.weekly' },
  { id: 'monthly', label: 'PageBuilder.SearchCTA.PriceFilter.monthly' },
  { id: 'yearly', label: 'PageBuilder.SearchCTA.PriceFilter.yearly' },
];

const getRangeConfig = tabId => {
  const configs = {
    weekly: { min: 1000000, max: 150000000, step: 1000000 }, // 1M-150M
    monthly: { min: 1000000, max: 500000000, step: 1000000 }, // 1M-500M
    yearly: { min: 50000000, max: 5000000000, step: 50000000 }, // 50M-5000M
  };
  return configs[tabId] || configs.monthly;
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

function PriceSelector({ selectedPeriod, onPeriodChange, priceRange, onPriceRangeChange }) {
  const USDConversionRate = useSelector(state => state.currency.conversionRate?.USD);
  const currency = useSelector(state => state.currency.selectedCurrency);

  const [activeTab, setActiveTab] = useState(selectedPeriod || 'monthly');
  const [range, setRange] = useState(priceRange || [1000000, 500000000]);
  const debounceRef = useRef(null);
  const [isTabChanging, setIsTabChanging] = useState(false);

  const getInitialConfig = () => getRangeConfig(selectedPeriod || 'monthly');
  const initialConfig = getInitialConfig();

  const [minInputValue, setMinInputValue] = useState(
    toDisplayValue(
      priceRange ? priceRange[0] : initialConfig.min,
      currency,
      USDConversionRate
    )
  );
  const [maxInputValue, setMaxInputValue] = useState(
    toDisplayValue(
      priceRange ? priceRange[1] : initialConfig.max,
      currency,
      USDConversionRate
    )
  );

  const debouncedPriceRangeChange = newRange => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onPriceRangeChange(newRange, activeTab);
    }, 300);
  };

  useEffect(() => {
    if (!isTabChanging) {
      setMinInputValue(toDisplayValue(range[0], currency, USDConversionRate));
      setMaxInputValue(toDisplayValue(range[1], currency, USDConversionRate));
    }
  }, [range, currency, isTabChanging, USDConversionRate]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleTabChange = tabId => {
    setIsTabChanging(true);
    setActiveTab(tabId);
    const config = getRangeConfig(tabId);
    const newRange = [config.min, config.max];
    setRange(newRange);
    onPeriodChange(tabId);
    onPriceRangeChange(newRange, tabId);

    setTimeout(() => {
      setIsTabChanging(false);
    }, 100);
  };

  const handleRangeChange = handles => {
    setRange(handles);
    debouncedPriceRangeChange(handles);
  };

  const handleInputChange = (e, isMin) => {
    const inputValue = e.target.value;
    const setInput = isMin ? setMinInputValue : setMaxInputValue;
    setInput(inputValue);

    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = fromDisplayValue(parseFloat(inputValue), currency, USDConversionRate);
      const config = getRangeConfig(activeTab);

      const [currentMin, currentMax] = range;
      let newRange;
      if (isMin) {
        if (value >= config.min && value <= config.max && value <= currentMax) {
          newRange = [value, currentMax];
        }
      } else {
        if (value <= config.max && value >= config.min && value >= currentMin) {
          newRange = [currentMin, value];
        }
      }

      if (newRange) {
        setRange(newRange);
        debouncedPriceRangeChange(newRange);
      }
    }
  };

  const handleInputBlur = (e, isMin) => {
    const inputValue = e.target.value;
    const setInput = isMin ? setMinInputValue : setMaxInputValue;

    if (inputValue !== '' && !isNaN(inputValue)) {
      const value = fromDisplayValue(parseFloat(inputValue), currency, USDConversionRate);
      const config = getRangeConfig(activeTab);
      const [currentMin, currentMax] = range;

      const clampedValue = isMin
        ? Math.max(config.min, Math.min(value, currentMax))
        : Math.min(config.max, Math.max(value, currentMin));

      if (clampedValue !== value) {
        setInput(toDisplayValue(clampedValue, currency, USDConversionRate));
        const newRange = isMin ? [clampedValue, currentMax] : [currentMin, clampedValue];
        setRange(newRange);
        debouncedPriceRangeChange(newRange);
      }
    } else if (inputValue === '') {
      setInput(toDisplayValue(isMin ? range[0] : range[1], currency, USDConversionRate));
    }
  };

  const config = getRangeConfig(activeTab);
  const displayConfig = {
    min: toDisplayValue(config.min, currency, USDConversionRate),
    max: toDisplayValue(config.max, currency, USDConversionRate),
    step: currency === 'IDR' ? config.step / 1000000 : 10,
  };

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h3 className={css.title}>
          <FormattedMessage id="PriceFilter.label" />
        </h3>
        <p className={css.description}>
          <FormattedMessage id="PriceFilter.description" />
          <>
            {currency === 'IDR' && <FormattedMessage id={'PriceFilter.inMillions'} />}
            {currency}{')'}
          </>
        </p>
      </div>

      <div className={css.tabsContainer}>
        <div className={css.tabsWrapper}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`${css.tab} ${activeTab === tab.id ? css.activeTab : ''}`}
            >
              <FormattedMessage id={tab.label} />
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

      <div className={css.sliderSection}>
        <div className={css.sliderWrapper}>
          <RangeSlider
            min={config.min}
            max={config.max}
            step={config.step}
            handles={range}
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
              onChange={e => handleInputChange(e, true)}
              onBlur={e => handleInputBlur(e, true)}
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
              onChange={e => handleInputChange(e, false)}
              onBlur={e => handleInputBlur(e, false)}
              min={displayConfig.min}
              max={displayConfig.max}
              step={displayConfig.step}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceSelector;
