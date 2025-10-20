import React, { useState, useEffect } from 'react';
import css from './ShareModal.module.css';
import Modal from '../Modal/Modal';
import IconClose from '../IconClose/IconClose';
import { SocialMediaLink } from '../../containers/PageBuilder/Primitives/Link';
import IconLink from '../IconLink/IconLink';
import IconShare from '../IconShare/IconShare';
import { FormattedMessage } from 'react-intl';

const ShareModal = ({ isOpen, onClose }) => {
  const [copyStatus, setCopyStatus] = useState('idle');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (typeof window === 'undefined') return null;

  const currentUrl = window.location.href;

  const copyLink = async () => {
    if (copyStatus !== 'idle') return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopyStatus('success');
    } catch (error) {
      setCopyStatus('error');
    } finally {
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const getTooltipMessage = () => {
    if (copyStatus === 'success') return 'Link copied!';
    if (copyStatus === 'error') return 'Failed to copy';
    return null;
  };

  const onManageDisableScrolling = () => {};

  return (
    <Modal
      id="ShareModal"
      isOpen={isOpen}
      onClose={onClose}
      onManageDisableScrolling={onManageDisableScrolling}
      containerClassName={css.shareModalContent}
      scrollLayerClassName={css.centeredScrollLayer}
      closeButtonMessage={<IconClose />}
      closeButtonClassName={css.customCloseButton}
    >
      <div onClick={e => e.stopPropagation()}>
        <div className={css.shareModalTop}>
          <div className={css.shareModalHeader}>
            <div className={css.headerSpacer} />
            <div className={css.headerCenter}>
              <IconShare color="black" />
              <div className={css.shareModalLabel}>
                <FormattedMessage id="ListingPage.share.share" />
              </div>
            </div>
            <div className={css.headerSpacer} />
          </div>
        </div>
        <p className={css.shareModalDescription}>
          <FormattedMessage id="ListingPage.share.shareListing" />
        </p>

        <div className={css.shareModalGrid}>
          {/* Facebook Share Button */}
          <div className={css.shareOption}>
            <SocialMediaLink
              platform="facebook"
              className={css.shareOptionIcon}
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            />
            <span className={css.shareOptionLabel}>Facebook</span>
          </div>

          {/* Twitter Share Button */}
          <div className={css.shareOption}>
            <SocialMediaLink
              platform="twitter"
              className={css.shareOptionIcon}
              href={`https://x.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`}
            />
            <span className={css.shareOptionLabel}>X</span>
          </div>

          {/* Copy Link Button (Universal) */}
          <button className={css.shareOption} onClick={copyLink}>
            {copyStatus !== 'idle' && (
              <div className={copyStatus === 'success' ? css.successTooltip : css.errorTooltip}>
                {getTooltipMessage()}
              </div>
            )}
            <div className={css.shareOptionIcon}>
              <IconLink />
            </div>
            <span className={css.shareOptionLabel}>Copy Link</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
