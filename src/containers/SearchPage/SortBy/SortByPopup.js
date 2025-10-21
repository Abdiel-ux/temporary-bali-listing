import React, { useState } from 'react';
import classNames from 'classnames';

import IconCollection from '../../../components/IconCollection/IconCollection';
import Menu from '../../../components/Menu/Menu';
import MenuContent from '../../../components/MenuContent/MenuContent';
import MenuItem from '../../../components/MenuItem/MenuItem';
import MenuLabel from '../../../components/MenuLabel/MenuLabel';
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
      onContentClick={mode === 'mobile' ? (e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      } : undefined}
    >
      <MenuLabel rootClassName={menuLabelClasses}>
        {
          mode === 'mobile' ? <>
            <span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.52344 1.375H12.2109M1.52344 4.75H8.83594M1.52344 8.125H8.83594M12.2109 4.75V13.75M12.2109 13.75L9.39844 10.9375M12.2109 13.75L15.0234 10.9375" stroke="#F74DF4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
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
                <path d="M1.52344 1.375H12.2109M1.52344 4.75H8.83594M1.52344 8.125H8.83594M12.2109 4.75V13.75M12.2109 13.75L9.39844 10.9375M12.2109 13.75L15.0234 10.9375" stroke="#F74DF4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            Sort by
          </h2>
          <span className={css.closeIcon} onClick={() => setIsOpen(false)}>
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
      </MenuContent>
    </Menu>
  );
};

export default SortByPopup;
