import React, { useState } from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import { FormattedMessage } from '../../../../../util/reactIntl';

import { OutsideClickHandler, IconCollection } from '../../../../../components';

import css from './FilterBedrooms.module.css';

const BedroomDropdown = ({
  input,
  className,
  rootClassName,
  alignLeft,
  isOpen,
  setIsOpen,
  setIsOpenPrice,
}) => {
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setIsOpenPrice(true);
  };

  const handleIncrement = () => {
    const currentValue = input.value || 0;
    const numValue = typeof currentValue === 'string' ? parseInt(currentValue, 10) : currentValue;
    const newValue = Math.min(6, numValue + 1);
    input.onChange(newValue);
  };

  const handleDecrement = () => {
    const currentValue = input.value || 0;
    const numValue = typeof currentValue === 'string' ? parseInt(currentValue, 10) : currentValue;
    const newValue = Math.max(0, numValue - 1);
    input.onChange(newValue);
  };

  const numValue = input.value || 0;
  const displayValue = typeof numValue === 'string' ? parseInt(numValue, 10) : numValue;

  const labelText =
    displayValue > 0 ? (
      displayValue === 1 ? (
        <FormattedMessage id="PageBuilder.SearchCTA.BedroomFilter.oneBedroom" />
      ) : (
        <FormattedMessage
          id="PageBuilder.SearchCTA.BedroomFilter.multipleBedrooms"
          values={{ count: displayValue === 6 ? '6+' : displayValue }}
        />
      )
    ) : (
      <FormattedMessage id="PageBuilder.SearchCTA.BedroomFilter.placeholder" />
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
            [css.unselected]: displayValue === 0 && !isOpen,
            [css.selected]: displayValue > 0,
            [css.opened]: isOpen,
          })}
        >
          <span className={css.bedroomIcon}>
            <IconCollection name="bedroom_icon" />
          </span>
          <div className={css.dropdownText}>
            <span className={css.mainLabel}>
              <FormattedMessage id="PageBuilder.SearchCTA.BedroomFilter.mainLabel" />
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
            <div className={css.counterModal}>
              <div className={css.menuItemMobile}>
                <h2 className={css.menuItemMobileTitle}>
                  <span className={css.menuItemMobileTitleIcon}>
                    <svg
                      width="18"
                      height="17"
                      viewBox="0 0 18 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.7695 10.082H1.23047C0.551988 10.082 0 10.634 0 11.3125V13.7734C0 14.0647 0.236109 14.3008 0.527344 14.3008H17.4727C17.7639 14.3008 18 14.0647 18 13.7734V11.3125C18 10.634 17.448 10.082 16.7695 10.082Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M16.7695 10.082H1.23047C0.551988 10.082 0 10.634 0 11.3125V13.7734C0 14.0647 0.236109 14.3008 0.527344 14.3008H17.4727C17.7639 14.3008 18 14.0647 18 13.7734V11.3125C18 10.634 17.448 10.082 16.7695 10.082Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                      <path
                        d="M17.2969 9.02734C17.2969 8.15361 16.5886 7.44531 15.7148 7.44531H2.28516C1.41142 7.44531 0.703125 8.15361 0.703125 9.02734H17.2969Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M17.2969 9.02734C17.2969 8.15361 16.5886 7.44531 15.7148 7.44531H2.28516C1.41142 7.44531 0.703125 8.15361 0.703125 9.02734H17.2969Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                      <path
                        d="M3.51562 6.39062V5.33594C3.51562 4.65746 4.06761 4.10547 4.74609 4.10547H7.20703C7.88551 4.10547 8.4375 4.65746 8.4375 5.33594V6.39062H9.5625V5.33594C9.5625 4.65746 10.1145 4.10547 10.793 4.10547H13.2539C13.9324 4.10547 14.4844 4.65746 14.4844 5.33594V6.39062H15.7148C16.023 6.39062 16.3187 6.44424 16.5938 6.5418V2.875C16.5938 1.61496 15.5686 0.589844 14.3086 0.589844H3.69141C2.43137 0.589844 1.40625 1.61496 1.40625 2.875V6.5418C1.68135 6.44424 1.97705 6.39062 2.28516 6.39062H3.51562Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M3.51562 6.39062V5.33594C3.51562 4.65746 4.06761 4.10547 4.74609 4.10547H7.20703C7.88551 4.10547 8.4375 4.65746 8.4375 5.33594V6.39062H9.5625V5.33594C9.5625 4.65746 10.1145 4.10547 10.793 4.10547H13.2539C13.9324 4.10547 14.4844 4.65746 14.4844 5.33594V6.39062H15.7148C16.023 6.39062 16.3187 6.44424 16.5938 6.5418V2.875C16.5938 1.61496 15.5686 0.589844 14.3086 0.589844H3.69141C2.43137 0.589844 1.40625 1.61496 1.40625 2.875V6.5418C1.68135 6.44424 1.97705 6.39062 2.28516 6.39062H3.51562Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                      <path
                        d="M4.74609 5.16016C4.64917 5.16016 4.57031 5.23901 4.57031 5.33594V6.39062H7.38281V5.33594C7.38281 5.23901 7.30396 5.16016 7.20703 5.16016H4.74609Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M4.74609 5.16016C4.64917 5.16016 4.57031 5.23901 4.57031 5.33594V6.39062H7.38281V5.33594C7.38281 5.23901 7.30396 5.16016 7.20703 5.16016H4.74609Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                      <path
                        d="M10.793 5.16016C10.696 5.16016 10.6172 5.23901 10.6172 5.33594V6.39062H13.4297V5.33594C13.4297 5.23901 13.3508 5.16016 13.2539 5.16016H10.793Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M10.793 5.16016C10.696 5.16016 10.6172 5.23901 10.6172 5.33594V6.39062H13.4297V5.33594C13.4297 5.23901 13.3508 5.16016 13.2539 5.16016H10.793Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                      <path
                        d="M1.58203 15.3555V15.8828C1.58203 16.174 1.81814 16.4102 2.10938 16.4102H3.16406C3.4553 16.4102 3.69141 16.174 3.69141 15.8828V15.3555H1.58203Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M1.58203 15.3555V15.8828C1.58203 16.174 1.81814 16.4102 2.10938 16.4102H3.16406C3.4553 16.4102 3.69141 16.174 3.69141 15.8828V15.3555H1.58203Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                      <path
                        d="M14.3086 15.3555V15.8828C14.3086 16.174 14.5447 16.4102 14.8359 16.4102H15.8906C16.1819 16.4102 16.418 16.174 16.418 15.8828V15.3555H14.3086Z"
                        fill="#4D4D4D"
                      />
                      <path
                        d="M14.3086 15.3555V15.8828C14.3086 16.174 14.5447 16.4102 14.8359 16.4102H15.8906C16.1819 16.4102 16.418 16.174 16.418 15.8828V15.3555H14.3086Z"
                        fill="black"
                        fill-opacity="0.2"
                      />
                    </svg>
                  </span>
                  Bedrooms
                </h2>
                <p className={css.menuItemMobileSubtitle}>Select the number of bedrooms you need</p>
                <span className={css.closeIcon} onClick={() => setIsOpen(false)}>
                  <IconCollection name="close_icon" />
                </span>
              </div>
              <div className={css.counterRow}>
                <span className={css.counterTitle}>
                  <FormattedMessage id="PageBuilder.SearchCTA.BedroomFilter.counterTitle" />
                </span>

                <div className={css.counterControls}>
                  <button
                    type="button"
                    className={classNames(css.counterButton, css.decrementButton)}
                    onClick={handleDecrement}
                    disabled={displayValue <= 0}
                    aria-label="Decrease bedrooms"
                  >
                    <svg
                      width="12"
                      height="2"
                      viewBox="0 0 12 2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.375 1H1.625"
                        stroke="#231F20"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <span className={css.counterValue}>
                    {displayValue === 6 ? '6+' : displayValue}
                  </span>

                  <button
                    type="button"
                    className={classNames(css.counterButton, css.incrementButton)}
                    onClick={handleIncrement}
                    disabled={displayValue >= 6}
                    aria-label="Increase bedrooms"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 1.625V10.375M10.375 6H1.625"
                        stroke="#231F20"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className={css.nextButtonContainer}>
                <button type="button" className={css.nextButton} onClick={closeDropdown}>
                  <FormattedMessage id="PageBuilder.SearchCTA.BedroomFilter.nextButton" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

const FilterBedrooms = props => {
  const { className, rootClassName, ...rest } = props;
  return (
    <Field
      {...rest}
      name="pub_bedrooms"
      component={BedroomDropdown}
      className={className}
      rootClassName={rootClassName}
    />
  );
};

export default FilterBedrooms;
