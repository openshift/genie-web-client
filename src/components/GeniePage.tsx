import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Content, PageSection, Button } from '@patternfly/react-core';
import { CommentIcon, CogIcon } from '@patternfly/react-icons';
import { DrawerProvider, useDrawer } from './global-drawer';
import './example.css';

function GeniePageContent() {
  const { t } = useTranslation('plugin__genie-web-client');
  const { openDrawer } = useDrawer();

  const handleOpenLeftDrawer = () => {
    openDrawer({
      heading: 'Left Drawer',
      icon: <CommentIcon />,
      position: 'left',
      children: (
        <div>
          <p>This is content in the left drawer.</p>
          <p>You can put any React components here.</p>
        </div>
      ),
      onClose: () => {
        console.log('Left drawer closed');
      },
    });
  };

  const handleOpenRightDrawer = () => {
    openDrawer({
      heading: 'Right Drawer',
      icon: <CogIcon />,
      position: 'right',
      children: (
        <div>
          <p>This is content in the right drawer.</p>
          <p>You can put any React components here.</p>
        </div>
      ),
      onClose: () => {
        console.log('Right drawer closed');
      },
    });
  };

  return (
    <>
      <PageSection>
        <Button onClick={handleOpenLeftDrawer}>
          Open Left Drawer
        </Button>
        <Button onClick={handleOpenRightDrawer}>
          Open Right Drawer
        </Button>
      </PageSection>
      <PageSection>
        <Content component="p">
          <span className="genie-web-client__nice">
            {t('genie')}
          </span>
        </Content>
      </PageSection>
    </>
  );
}

export default function GeniePage() {
  return (
    <DrawerProvider>
      <GeniePageContent />
    </DrawerProvider>
  );
}
