import React from 'react';
import { ReactComponent as IconSolutionEagle } from './solution-eagle.svg';
import { ReactComponent as IconSolutionAsiaPlus } from './solution-aplus.svg';
import { ReactComponent as IconSolutionLib } from './solution-lib.svg';

import baliLuxeWebp from './bali-luxe.webp';
import futurifyWebp from './futurify.webp';
import legalVisaWebp from './legal-visa.webp';
import liluWebp from './lilu.webp';

const iconMap = {
  'legal visa bali': legalVisaWebp,
  'eagle protect': IconSolutionEagle,
  'bali luxe rent': baliLuxeWebp,
  futurify: futurifyWebp,
  'asia plus invest': IconSolutionAsiaPlus,
  'live in bali': IconSolutionLib,
  'lilu rental': liluWebp,
};

const IconSolution = ({ solutionName, className }) => {
  if (!solutionName) {
    return null;
  }
  const icon = iconMap[solutionName.toLowerCase()];

  if (!icon) {
    return null;
  }

  if (typeof icon === 'string') {
    return <img src={icon} alt={solutionName} className={className} />;
  }
  
  const IconComponent = icon;
  return <IconComponent className={className} />;
};

export default IconSolution;
