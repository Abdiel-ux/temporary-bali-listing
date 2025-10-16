import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useParams, Link } from 'react-router-dom';

import NotFoundPage from '../NotFoundPage/NotFoundPage.js';
import TopbarContainer from '../TopbarContainer/TopbarContainer.js';
import FooterContainer from '../FooterContainer/FooterContainer.js';
import ResponsiveImage from '../../components/ResponsiveImage/ResponsiveImage.js';
import { IconDate } from '../../components/index.js';
import { loadData } from './BlogListPage.duck.js';

import css from './BlogListPage.module.css';
import { ReactComponent as Spiral } from '../../assets/about-us-spiral.svg';
import { ReactComponent as UserIcon } from '../../assets/usericon.svg';

const getInfoFromText = text => {
  const dateRegex = /\*(\d{2}\/\d{2}\/\d{2})\*/;
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

  const description = text.replace(dateRegex, '').replace(/######/g, '').trim();

  return { date, description };
};

const BlogCard = ({ block }) => {
  const { date, description } = getInfoFromText(block.text?.content || '');
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
        />
      )}
      <div className={css.cardContent}>
        <div className={css.topMeta}>
          <div className={css.meta}>
            <div className={css.author}>
              <UserIcon />
              <span>Wesley Silalahi</span>
            </div>
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
  const dispatch = useDispatch();
  const params = useParams();
  const pageId = params.pageId || 'blog';

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
  const blocks = pageData?.sections?.[0]?.blocks || [];

  return (
    <div className={css.root}>
      <TopbarContainer />
      <div className={css.hero}>
        <Spiral className={css.spiral} />
        <h1 className={css.heroTitle}>Blog</h1>
      </div>
      <div className={css.content}>
        <div className={css.grid}>
          {blocks.map((block, i) => (
            <BlogCard key={i} block={block} />
          ))}
        </div>
      </div>
      <FooterContainer />
    </div>
  );
};

export default BlogListPage;