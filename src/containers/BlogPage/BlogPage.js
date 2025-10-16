import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import unified from 'unified';
import parse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import rehypeReact from 'rehype-react';

import NotFoundPage from '../NotFoundPage/NotFoundPage.js';
import TopbarContainer from '../TopbarContainer/TopbarContainer.js';
import FooterContainer from '../FooterContainer/FooterContainer.js';
import ResponsiveImage from '../../components/ResponsiveImage/ResponsiveImage.js';
import IconDate from '../../components/IconDate/IconDate.js';

import css from './BlogPage.module.css';
import { SocialMediaLink } from '../PageBuilder/Primitives/Link/SocialMediaLink.js';

const Markdown = ({ content }) => {
  const result = unified()
    .use(parse)
    .use(remark2rehype)
    .use(rehypeReact, { createElement: React.createElement })
    .processSync(content).result;
  return <div className={css.markdownContent}>{result}</div>;
};

const BlogBlock = ({ block, isWide }) => {
  const { media, title, text, callToAction } = block;
  const image = media?.image;
  let imageVariants = [];
  let sizes = '';
  
  if (image) {
    if (isWide) {
      imageVariants = ['landscape400', 'landscape800', 'landscape1200'];
      sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px";
    } else {
      imageVariants = ['landscape400', 'landscape800'];
      sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 800px";
    }
  }

  const imageWrapperClass = isWide ? css.wideImageWrapper : css.blockImageWrapper;

  const ctaButton =
    callToAction?.content &&
    callToAction?.href &&
    callToAction?.fieldType === 'internalButtonLink' ? (
      <Link to={callToAction.href} className={css.ctaButton}>
        {callToAction.content}
      </Link>
    ) : null;

  return (
    <div className={css.blogBlock}>
      {image?.id && imageVariants.length > 0 && (
        <div className={imageWrapperClass}>
          <ResponsiveImage
            alt={media.alt || title?.content || 'Blog image'}
            image={image}
            variants={imageVariants}
            sizes={sizes}
            className={css.blockImage}
          />
        </div>
      )}
      {title?.content && <h2 className={css.blockTitle}>{title.content}</h2>}
      {text?.content && <Markdown content={text.content} />}
      {ctaButton}
    </div>
  );
};

const BlogPage = props => {
  const params = useParams();
  const { blogId } = params;

  const { pageAssetsData, inProgress, error } = useSelector(
    state => state.hostedAssets || {},
    shallowEqual
  );

  if (error?.status === 404) {
    return <NotFoundPage staticContext={props.staticContext} />;
  }

  const pageData = pageAssetsData?.[blogId]?.data;
  if (!pageData) {
    return <div className={css.root} />;
  }

  const section = pageData?.sections?.[0];

  if (!section) {
    return <NotFoundPage staticContext={props.staticContext} />;
  }

  const title = section.title?.content;
  const [dateString, author] = section.description?.content
    .replace('Published on ', '')
    .split(' - ');
  const blocks = section.blocks || [];
  const firstImageBlockIndex = blocks.findIndex(b => b.media?.image);

  return (
    <div className={css.root}>
      <TopbarContainer />
      <div className={css.container}>
        <div className={css.mainContent}>
          <Link to="/blog" className={css.backLink}>
            &larr; Back to Blog
          </Link>
          <div className={css.blogHeader}>
            <h1 className={css.title}>{title}</h1>
            <div className={css.metaContainer}>
              <div className={css.author}>
                <div className={css.metaLabel}>Creator</div>
                <div className={css.authorName}>{author}</div>
              </div>
              <div className={css.dateWrapper}>
                <IconDate className={css.dateIcon} />
                <span className={css.dateText}>{dateString}</span>
              </div>
            </div>
          </div>

          <div className={css.sidebar}>
            <SocialMediaLink
              platform="instagram"
              href="https://www.instagram.com/balilistings?igsh=MTV4Mzlscm10ZGF1Mg=="
              className={css.socialIconLink}
            />
            <SocialMediaLink
              platform="facebook"
              href="https://www.facebook.com/share/1F9hrCkY6A/?mibextid=wwXIfr"
              className={css.socialIconLink}
            />
            <SocialMediaLink
              platform="linkedin"
              href="https://www.linkedin.com/company/bali-listings"
              className={css.socialIconLink}
            />
          </div>

          <div className={css.content}>
            {blocks.map((block, index) => (
              <BlogBlock
                key={block.blockName || index}
                block={block}
                isWide={index === firstImageBlockIndex}
              />  
            ))}
          </div>
        </div>
      </div>
      <FooterContainer />
    </div>
  );
};

export default BlogPage;