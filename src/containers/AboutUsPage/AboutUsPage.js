import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useParams } from 'react-router-dom';
import unified from 'unified';
import parse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import rehypeReact from 'rehype-react';

import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer.js';
import ResponsiveImage from '../../components/ResponsiveImage/ResponsiveImage';
import { loadData } from './AboutUsPage.duck';
import { Page, LayoutSingleColumn } from '../../components/index.js';
import { useConfiguration } from '../../context/configurationContext';
import { extractPageMetadata } from '../../util/seo';

import css from './AboutUsPage.module.css';
import { FormattedMessage } from 'react-intl';
import { ReactComponent as Spiral } from '../../assets/about-us-spiral.svg';
import CTABlock from '../../components/CTAFooter/CTAFooter.js';

const renderAst = new rehypeReact({ createElement: React.createElement }).Compiler;

const useInView = options => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { ...options }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return [ref, isInView];
};

const AnimatedWrapper = ({ children, ...props }) => {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      {...props}
      className={`${props.className || ''} ${css.animatedBlock} ${isInView ? css.inView : ''}`}
    >
      {children}
    </div>
  );
};

const AboutUsPage = props => {
  const dispatch = useDispatch();
  const params = useParams();
  const config = useConfiguration();

  // intentional to use new content page, to make it easier to switch between the old about page and the new one because of the content difference
  // TODO: move "about-new" content to "about", and then change the page id here to "about". Right now it's retrieving content from both "about" and "about-new"
  const pageId = 'about-new';

  const { pageAssetsData, inProgress, error } = useSelector(
    state => state.hostedAssets || {},
    shallowEqual
  );

  useEffect(() => {
    if (inProgress || pageAssetsData?.[pageId]) {
      return;
    }
    dispatch(loadData(params));
  }, [dispatch, params, pageId, inProgress, pageAssetsData]);

  if (inProgress) {
    return <div className={css.root} />;
  }

  if (error?.status === 404) {
    return <NotFoundPage staticContext={props.staticContext} />;
  }

  const pageData = pageAssetsData?.[pageId]?.data;

  // Extract meta information using the helper function
  const { title, description, schema, socialSharing } = extractPageMetadata(pageData, 'WebPage');

  const toReact = markdown => {
    if (!markdown) return null;
    const content = unified()
      .use(parse)
      .parse(markdown);
    const rehypeAst = unified()
      .use(remark2rehype)
      .runSync(content);
    return renderAst(rehypeAst);
  };

  const section = pageData?.sections?.[0];
  const blocks = section?.blocks || [];

  const renderBlock = (block, i) => {
    const title = block.title?.content;
    const rawContent = block.text?.content;
    const image = block.media?.image;
    const imageAlt = block.media?.alt;

    // KEMBALIKAN KE CARA SEBELUMNYA - gunakan variasi yang tersedia di CMS
    const imageVariants = image ? [ 'original400', 'original800' ] : [];

    if (i === 0) {
      return (
        <AnimatedWrapper key={i} className={css.section}>
          <h2 className={css.sectionTitle} style={{ whiteSpace: 'pre-line' }}>
            {title}
          </h2>
          <div className={css.sectionText}>{toReact(rawContent)}</div>
        </AnimatedWrapper>
      );
    }
    if (i === 1 || i === 7) {
      // Mission, Explore
      return (
        <AnimatedWrapper key={i} className={css.missionParent}>
          <h2 className={`${css.missionTitle} ${css.mobileOnly}`}>{title}</h2>
          <div className={css.missionSection}>
            {image ? (
              <ResponsiveImage
                alt={imageAlt || title}
                image={image}
                variants={imageVariants}
                className={css.missionImage}
                sizes="(max-width: 768px) 100vw, 800px"
              />
            ) : null}
            <div className={css.missionContent}>
              <h2 className={`${css.missionTitle} ${css.desktopOnly}`}>{title}</h2>
              <div className={css.missionText}>{toReact(rawContent)}</div>
            </div>
          </div>
        </AnimatedWrapper>
      );
    }
    if (i === 2) {
      return (
        <AnimatedWrapper key={i} className={css.differentSection}>
          <h2 className={css.differentTitle} style={{ whiteSpace: 'pre-line' }}>
            {title}
          </h2>
          <div className={css.differentText}>{toReact(rawContent)}</div>
        </AnimatedWrapper>
      );
    }
    if (i === 3 || i === 5) {
      // Smart Filters, Free to use
      const [mainText, pillText] = rawContent.split('\n\n');
      const pills = (pillText || ' ')
        .substring(2)
        .split('\n> ')
        .map(p => p.replace(/\\|\./g, '').trim());

      return (
        <AnimatedWrapper key={i} className={css.missionParent}>
          <h3 className={`$ ${css.mobileOnly}`}>{title}</h3>
          <div className={css.featureSection}>
            <div className={css.missionContent}>
              <h3 className={`${css.desktopOnly}`}>{title}</h3>
              <div className={css.missionText}>{toReact(mainText)}</div>
              <div className={css.pillsContainer}>
                {pills.map((pill, j) => (
                  <div key={j} className={css.pill}>
                    {pill}
                  </div>
                ))}
              </div>
            </div>
            {image ? (
              <ResponsiveImage
                alt={imageAlt || title}
                image={image}
                variants={imageVariants}
                className={css.missionImage}
                sizes="(max-width: 768px) 100vw, 800px"
              />
            ) : null}
          </div>
        </AnimatedWrapper>
      );
    }
    if (i === 4) {
      // Verified
      const [mainText, pillText] = rawContent.split('\n\n');
      const pills = (pillText || ' ')
        .substring(2)
        .split('\n> ')
        .map(p => p.replace(/\\|\./g, '').trim());

      return (
        <AnimatedWrapper key={i} className={css.missionParent}>
          <h3 className={`${css.mobileOnly}`}>{title}</h3>
          <div className={css.missionSection}>
            {image ? (
              <ResponsiveImage
                alt={imageAlt || title}
                image={image}
                variants={imageVariants}
                className={css.missionImage}
                sizes="(max-width: 768px) 100vw, 800px"
              />
            ) : null}
            <div className={css.missionContent}>
              <h3 className={`${css.desktopOnly}`}>{title}</h3>
              <div className={css.missionText}>{toReact(mainText)}</div>
              <div className={css.pillsContainer}>
                {pills.map((pill, j) => (
                  <div key={j} className={css.pill}>
                    {pill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedWrapper>
      );
    }
    if (i === 6) {
      // Why people choose us
      const textParts = rawContent.split('\n\n');
      const mainText = textParts[0];
      const statsContent = textParts[1] || '';
      const stats =
        statsContent.length > 0
          ? statsContent
              .substring(2)
              .split('\n> ')
              .map(s => {
                const [number, ...labelParts] = s.split('. ');
                const label = labelParts.join('. ');
                return {
                  number: number.trim(),
                  label: label.replace(/\\/g, '').trim(),
                };
              })
          : [];

      return (
        <AnimatedWrapper key={i} className={css.statsSection}>
          <h2 className={css.statsTitle}>{title}</h2>
          <p className={css.statsText}>{mainText}</p>
          <div className={css.statsContainer}>
            {stats.map((stat, j) => (
              <div key={j} className={css.statItem}>
                <p className={css.statNumber}>{stat.number}</p>
                <p className={css.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedWrapper>
      );
    }

    return null;
  };

  return (
    <Page {...{ title, description, schema, socialSharing }} config={config} className={css.root}>
      <LayoutSingleColumn
        topbar={<TopbarContainer />}
        footer={<FooterContainer />}
      >
        <div className={css.hero}>
          <Spiral className={css.spiral} />
          <h1 className={css.heroTitle}>
            <FormattedMessage id="TranslatedLink.aboutUs" />
          </h1>
        </div>
        <div className={css.content}>
          {blocks.map((block, i) => {
            if (i > 2 && i <= 5) {
              return null;
            }
            if (i === 2) {
              return (
                <AnimatedWrapper key="group-2-5" className={css.featureGroup}>
                  {blocks.slice(2, 6).map((b, j) => renderBlock(b, j + 2))}
                </AnimatedWrapper>
              );
            }
            return renderBlock(block, i);
          })}
        </div>
        <CTABlock />
      </LayoutSingleColumn>
    </Page>
  );
};

export default AboutUsPage;