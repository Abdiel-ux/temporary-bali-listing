import React, { useState } from 'react';
import ListingImageGallery from './ListingImageGallery/ListingImageGallery';

import css from './ListingPage.module.css';
import IconCollection from '../../components/IconCollection/IconCollection';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import ShareModal from '../../components/ShareModal/ShareModal';
import IconShare from '../../components/IconShare/IconShare';
import { checkIsProvider } from '../../util/userHelpers';

const SectionGallery = props => {
  const { listing, variantPrefix, onToggleFavorites, currentUser } = props;
  const isFavorite = currentUser?.attributes.profile.privateData.favorites?.includes(
    listing.id.uuid
  );
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const history = useHistory();
  const images = listing.images;
  const imageVariants = ['scaled-small', 'scaled-medium', 'scaled-large', 'scaled-xlarge'];
  const thumbnailVariants = [variantPrefix, `${variantPrefix}-2x`, `${variantPrefix}-4x`];

  const toggleFavorites = () => onToggleFavorites(isFavorite);

  return (
    <section className={css.productGallery} data-testid="carousel">
      <div className={css.backButtonContainer}>
        <div className={css.backButton} onClick={() => history.goBack()}>
          <IconCollection name="icon-back" />
        </div>
        <div className={css.rightButtons}>
          <button className={css.shareButton} onClick={() => setShareModalOpen(true)}>
            <IconShare />
          </button>
          {!checkIsProvider(currentUser) && (
            <button
              className={classNames(css.wishlistButton, isFavorite ? css.active : '')}
              onClick={toggleFavorites}
            >
              <IconCollection name="icon-waislist" />
            </button>
          )}
        </div>
      </div>
      <ListingImageGallery
        images={images}
        imageVariants={imageVariants}
        thumbnailVariants={thumbnailVariants}
      />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} />
    </section>
  );
};

export default SectionGallery;
