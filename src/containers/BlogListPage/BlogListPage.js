import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useParams, Link } from 'react-router-dom';

import NotFoundPage from '../NotFoundPage/NotFoundPage.js';
import TopbarContainer from '../TopbarContainer/TopbarContainer.js';
import FooterContainer from '../FooterContainer/FooterContainer.js';
import ResponsiveImage from '../../components/ResponsiveImage/ResponsiveImage.js';
import { IconDate, Page, LayoutSingleColumn } from '../../components/index.js';
import { useConfiguration } from '../../context/configurationContext';
import { extractPageMetadata } from '../../util/seo';

import css from './BlogListPage.module.css';
import { ReactComponent as Spiral } from '../../assets/about-us-spiral.svg';
import { ReactComponent as UserIcon } from '../../assets/usericon.svg';
import CTABlock from '../../components/CTAFooter/CTAFooter.js';

export const getInfoFromText = text => {
  const dateRegex = /\*(\d{2}\/\d{2}\/\d{2})\*/;
  const tagRegex = /--([^-]+)--/;
  const authorRegex = /---([^-]+)---/;

  const dateMatch = text.match(dateRegex);
  let date = dateMatch ? dateMatch[1] : '';

  if (date) {
    const [month, day, year] = date.split('/');
    const dateObj = new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day));
    const dayOfMonth = dateObj.getDate();
    const monthName = dateObj.toLocaleString('default', { month: 'short' });
    const fullYear = dateObj.getFullYear();
    date = `${dayOfMonth} ${monthName}, ${fullYear}`;
  }

  const tagMatch = text.match(tagRegex);
  const tag = tagMatch ? tagMatch[1] : '';

  const authorMatch = text.match(authorRegex);
  const author = authorMatch ? authorMatch[1] : '';

  const description = text
    .replace(dateRegex, '')
    .replace(tagRegex, '')
    .replace(authorRegex, '')
    .replace(/######/g, '')
    .trim();

  return { date, description, tag, author };
};

export const BlogCard = ({ block }) => {
  const { date, description, tag, author } = getInfoFromText(block.text?.content || '');
  const image = block.media?.image;
  
  const imageVariants = image ? ['landscape400', 'landscape800'] : [];
  const sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px";

  const href = block.callToAction?.href.replace('/p', '/blog') || '#';

  return (
    <Link to={href} className={css.card}>
      {image && imageVariants.length > 0 && (
        <ResponsiveImage
          alt={block.media?.alt || block.title?.content}
          image={image}
          variants={imageVariants}
          sizes={sizes}
          className={css.cardImage}
          sizes={"600px"}
        />
      )}
      <div className={css.cardContent}>
        <div className={css.topMeta}>
          {tag && <div className={css.category}>{tag}</div>}
          <div className={css.meta}>
            {author && (
              <div className={css.author}>
                <UserIcon />
                <span>{author}</span>
              </div>
            )}
            <div className={css.date}>
              <IconDate />
              <span>{date}</span>
            </div>
          </div>
        </div>
        <h2 className={css.title}>{block.title?.content}</h2>
        <p className={css.description}>{description}</p>
      </div>
    </Link>
  );
};

const BlogListPage = props => {
  const params = useParams();
  const pageId = params.pageId || 'blog';
  const config = useConfiguration();

  const { pageAssetsData, inProgress, error } = useSelector(
    state => state.hostedAssets || {},
    shallowEqual
  );

  const [activeTag, setActiveTag] = useState('All');

  if (inProgress) {
    return <div className={css.root} />;
  }

  if (error?.status === 404) {
    return <NotFoundPage staticContext={props.staticContext} />;
  }

  const pageData = pageAssetsData?.[pageId]?.data;
  const blocks = pageData?.sections?.[0]?.blocks || [];

  const allTags = ['All', ...new Set(blocks.map(block => getInfoFromText(block.text?.content || '').tag).filter(Boolean))];

  const filteredBlocks = activeTag === 'All' ? blocks : blocks.filter(block => getInfoFromText(block.text?.content || '').tag === activeTag);

  // Extract meta information using the helper function
  const { title, description, schema, socialSharing } = extractPageMetadata(pageData, 'WebPage');

  return (
    <Page {...{ title, description, schema, socialSharing }} config={config} className={css.root}>
      <LayoutSingleColumn
        topbar={<TopbarContainer />}
        footer={<FooterContainer />}
      >
        <div className={css.hero}>
          <Spiral className={css.spiral} />
          <h1 className={css.heroTitle}>Blog</h1>
        </div>
        <div className={css.content}>
          <div className={css.tabs}>
            {allTags.map(tag => (
              <button
                key={tag}
                className={activeTag === tag ? css.activeTab : css.tab}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className={css.grid}>
            {filteredBlocks.map((block, i) => (
              <BlogCard key={i} block={block} />
            ))}
          </div>
        </div>
        <CTABlock />
      </LayoutSingleColumn>
    </Page>
  );
};

export default BlogListPage;