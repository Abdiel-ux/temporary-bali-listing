import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../Button/Button';
import css from './CTAFooter.module.css';
import sofaSrc from './cta-sofa.webp';

const CTA = ({ variant = 'primary' }) => {
  const title = variant === 'primary' ? 'CTAFooter.title' : 'CTAFooter.titleSolution';
  const subtitle = variant === 'primary' ? 'CTAFooter.subtitle' : 'CTAFooter.subtitleSolution';
  const tagline = variant === 'primary' ? 'CTAFooter.tagline' : 'CTAFooter.taglineSolution';
  const startButton =
    variant === 'primary' ? 'CTAFooter.startButton' : 'CTAFooter.startButtonSolution';

  return (
    <div className={css.root}>
      <div className={css.circleLineLeft} />
      <div className={css.circleLineRight} />
      <img src={sofaSrc} className={css.sofa} alt="cta-sofa" fetchpriority="low" />

      <div className={css.content}>
        <div className={css.textContent}>
          <h1 className={css.title}>
            <FormattedMessage
              id={title}
              defaultMessage="Ready to list your villa or find your next home"
            />
          </h1>
          <p className={css.subtitle}>
            <FormattedMessage
              id={subtitle}
              defaultMessage="We're building the future of real estate in Bali"
            />
          </p>
          <p className={css.tagline}>
            <FormattedMessage id={tagline}/>
          </p>
          <Button className={css.button}>
            <FormattedMessage id={startButton} defaultMessage="Start now" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CTA;
