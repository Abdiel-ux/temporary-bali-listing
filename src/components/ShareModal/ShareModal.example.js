import React, { useState } from 'react';
import ShareModal from './ShareModal';
import { Button } from '../../components';

const onManageDisableScrolling = (componentId, scrollingDisabled = true) => {
  // We are just checking the value for now
  console.log('Toggling Modal - scrollingDisabled currently:', componentId, scrollingDisabled);
};

const ShareModalWrapper = props => {
  const [isOpen, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <div>
      <div style={{ margin: '1rem' }}>Wrapper text before Modal</div>

      <ShareModal
        {...props}
        isOpen={isOpen}
        onClose={() => {
          setOpen(false);
          console.log('Closing modal');
        }}
        onManageDisableScrolling={onManageDisableScrolling}
      />

      <div style={{ margin: '1rem' }}>
        <Button onClick={handleOpen}>Open Share Modal</Button>
      </div>
    </div>
  );
};

export const Default = {
  component: ShareModalWrapper,
  useDefaultWrapperStyles: false,
  props: {
    id: 'ShareModal',
  },
};
