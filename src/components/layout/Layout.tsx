import { useRef, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom-v5-compat';
import {
  Compass,
  Avatar,
  Brand,
  CompassHeader,
  CompassPanel,
  CompassMessageBar,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  CompassContent,
  CompassMainFooter,
} from '@patternfly/react-core';
import { useDrawer } from '../drawer';
import { useChatBar } from '../ChatBarContext';
import RedHatLogo from '../../assets/images/RHLogo.svg';
import AvatarImg from '../../assets/images/avatar.svg';

import { LayoutMessageBar } from './LayoutMessageBar';
import { LayoutNav } from './LayoutNav';
import { LayoutSidebarStart } from './LayoutSidebarStart';
import { LayoutSidebarEnd } from './LayoutSidebarEnd';
import './Layout.css';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { showChatBar } = useChatBar();
  const { drawerState, closeDrawer } = useDrawer();
  const messageBarRef = useRef<HTMLTextAreaElement>(null);

  // Header components
  const genieLogo = <Brand src={RedHatLogo} alt="Genie Logo" widths={{ default: '120px' }} />;
  const userAccount = <Avatar src={AvatarImg} alt="User Account" />;

  const header = (
    <CompassHeader
      logo={genieLogo}
      nav={<LayoutNav />}
      profile={userAccount}
    />
  );

  // Footer component
  const footer = (
    <CompassMainFooter>
      <CompassMessageBar>
        <CompassPanel isPill hasNoPadding>
          <LayoutMessageBar messageBarRef={messageBarRef} />
        </CompassPanel>
      </CompassMessageBar>
    </CompassMainFooter>
  );

  const drawerContent = drawerState.isOpen ? (
    <DrawerPanelContent>
      <DrawerHead>
        <div className="drawer-heading">
          {drawerState.icon ? (
            <span className="drawer-heading__icon">{drawerState.icon}</span>
          ) : null}
          <span className="drawer-heading__text">{drawerState.heading}</span>
        </div>
        <DrawerActions>
          <DrawerCloseButton onClick={closeDrawer} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>{drawerState.children}</DrawerPanelBody>
    </DrawerPanelContent>
  ) : undefined;

  return (
    <Compass
      header={header}
      isHeaderExpanded={true}
      sidebarStart={<LayoutSidebarStart />}
      sidebarEnd={<LayoutSidebarEnd />}
      main={
        <CompassContent>
          <Outlet />
        </CompassContent>
      }
      footer={footer}
      isFooterExpanded={showChatBar}
      drawerContent={drawerContent}
      drawerProps={{
        isPill: true,
        isExpanded: drawerState.isOpen,
        position: drawerState.position,
      }}
    >
      {children}
    </Compass>
  );
};
