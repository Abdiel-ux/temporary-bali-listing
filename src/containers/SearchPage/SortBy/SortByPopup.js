import React, { useState } from 'react';
import classNames from 'classnames';

import { IconCollection, Menu, MenuContent, MenuItem, MenuLabel } from '../../../components';
import css from './SortByPopup.module.css';

const optionLabel = (options, key) => {
  const option = options.find(o => o.key === key);
  return option ? option.label : key;
};

const SortByIcon = props => {
  const classes = classNames(css.icon, props.className);
  // extra small arrow head (down)
  return (

    <svg className={classes} width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M6.60409 7.21001C6.70956 7.31535 6.85253 7.37451 7.00159 7.37451C7.15066 7.37451 7.29362 7.31535 7.39909 7.21001L13.0241 1.58501C13.1235 1.47838 13.1775 1.33734 13.175 1.19162C13.1724 1.04589 13.1134 0.90685 13.0103 0.80379C12.9073 0.700731 12.7682 0.641697 12.6225 0.639126C12.4768 0.636555 12.3357 0.690647 12.2291 0.790007L7.00159 6.01751L1.77409 0.790007C1.66746 0.690647 1.52643 0.636555 1.3807 0.639126C1.23498 0.641697 1.09594 0.700731 0.992878 0.80379C0.889818 0.90685 0.830784 1.04589 0.828213 1.19162C0.825641 1.33734 0.879734 1.47838 0.979094 1.58501L6.60409 7.21001Z" fill="#F74DF4" />
    </svg>


  );
};

/**
 * SortByPopup component
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that extends the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.menuLabelRootClassName] - Custom class that extends the default class for the menu label
 * @param {string} props.urlParam - The url param
 * @param {string} props.label - The label
 * @param {Function} props.onSelect - The function to handle the select
 * @param {Array<Object>} props.options - The options [{ key: string, label: string }]
 * @param {string} [props.initialValue] - The initial value
 * @param {number} [props.contentPlacementOffset] - The content placement offset
 * @returns {JSX.Element}
 */
const SortByPopup = props => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    rootClassName,
    className,
    menuLabelRootClassName,
    urlParam,
    label,
    options,
    initialValue,
    contentPlacementOffset = 0,
    onSelect,
    mode,
  } = props;

  const onToggleActive = isOpenParam => {
    setIsOpen(isOpenParam);
  };

  const selectOption = (urlParameter, option) => {
    setIsOpen(false);
    onSelect(urlParameter, option);
  };

  // resolve menu label text and class
  const menuLabel = initialValue ? optionLabel(options, initialValue) : label;

  const classes = classNames(rootClassName || css.root, className);
  const menuLabelClasses = classNames(menuLabelRootClassName);
  const iconArrowClassName = isOpen ? css.iconArrowAnimation : null;

  return (
    <Menu
      className={classes}
      useArrow={false}
      contentPlacementOffset={contentPlacementOffset}
      contentPosition="left"
      onToggleActive={onToggleActive}
      isOpen={isOpen}
      preferScreenWidthOnMobile
    >
      <MenuLabel rootClassName={menuLabelClasses}>
        {
          mode === 'mobile' ? <>
            <span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1.25391C10.0663 1.25391 12.0913 1.42791 14.0623 1.76241C14.462 1.82991 14.75 2.17941 14.75 2.58441V3.36741C14.75 3.58901 14.7064 3.80845 14.6216 4.01319C14.5367 4.21793 14.4124 4.40396 14.2557 4.56066L10.1818 8.63466C10.0251 8.79136 9.90075 8.97739 9.81595 9.18213C9.73114 9.38687 9.6875 9.6063 9.6875 9.82791V12.0232C9.68756 12.3366 9.6003 12.6439 9.43551 12.9106C9.27071 13.1773 9.0349 13.3928 8.7545 13.5329L6.3125 14.7539V9.82791C6.3125 9.6063 6.26886 9.38687 6.18405 9.18213C6.09925 8.97739 5.97495 8.79136 5.81825 8.63466L1.74425 4.56066C1.58755 4.40396 1.46325 4.21793 1.37845 4.01319C1.29364 3.80845 1.25 3.58901 1.25 3.36741V2.58441C1.25 2.17941 1.538 1.82991 1.93775 1.76241C3.94068 1.4233 5.96857 1.2532 8 1.25391Z" stroke="#F74DF4" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round" />
              </svg>

            </span>
            Sort by
          </> :

            <>
              {menuLabel}
              <SortByIcon className={iconArrowClassName} />
            </>}

      </MenuLabel>
      <MenuContent className={css.menuContent}>
        <MenuItem key="reset" className={css.menuItemMobile}>
          <h2 className={css.menuItemMobileTitle}>
            <span className={css.menuItemMobileTitleIcon}>
              <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0.750002C10.0663 0.750002 12.0913 0.924002 14.0623 1.2585C14.462 1.326 14.75 1.6755 14.75 2.0805V2.8635C14.75 3.08511 14.7064 3.30455 14.6216 3.50928C14.5367 3.71402 14.4124 3.90005 14.2557 4.05675L10.1818 8.13075C10.0251 8.28745 9.90075 8.47348 9.81595 8.67822C9.73114 8.88296 9.6875 9.1024 9.6875 9.324V11.5193C9.68756 11.8327 9.6003 12.14 9.43551 12.4067C9.27071 12.6734 9.0349 12.8888 8.7545 13.029L6.3125 14.25V9.324C6.3125 9.1024 6.26886 8.88296 6.18405 8.67822C6.09925 8.47348 5.97495 8.28745 5.81825 8.13075L1.74425 4.05675C1.58755 3.90005 1.46325 3.71402 1.37845 3.50928C1.29364 3.30455 1.25 3.08511 1.25 2.8635V2.0805C1.25 1.6755 1.538 1.326 1.93775 1.2585C3.94068 0.919392 5.96857 0.749293 8 0.750002Z" stroke="#F74DF4" stroke-width="1.5" stroke-linecap="round" strokeLinejoin="round" />
              </svg>
              
            </span>
            Sort by
          </h2>
          <span className={css.closeIcon}>
          <IconCollection name="close_icon" />
          </span>
        </MenuItem>
        {options.map(option => {
          // check if this option is selected
          const selected = initialValue === option.key;
          // menu item border class
          const menuItemBorderClass = selected ? css.menuItemBorderSelected : css.menuItemBorder;

          return (
            <MenuItem key={option.key}>
              <button
                className={css.menuItem}
                disabled={option.disabled}
                onClick={() => (selected ? null : selectOption(urlParam, option.key))}
              >

                <span>
                  {option.longLabel || option.label}
                </span>
                <span className={menuItemBorderClass}>
                  <span className={css.menuItemBorderIcon}>

                  </span>
                </span>
              </button>
            </MenuItem>
          );
        })}
        {/* <MenuItem key="reset" className={css.menuItemMobile}>
        <div className={css.footer}>
          <button className={css.resetButton}>
            Reset All
          </button>
          <button className={css.showListingsButton}>
           Save
          </button>
        </div>
        </MenuItem> */}
      </MenuContent>
    </Menu>
  );
};

export default SortByPopup;
