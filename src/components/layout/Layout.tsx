import { useEffect, useRef, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom-v5-compat';
import {
  Compass,
  Brand,
  CompassHeader,
  CompassPanel,
  CompassMessageBar,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  DrawerContent,
  DrawerContentBody,
  CompassContent,
  CompassMainFooter,
  Icon,
} from '@patternfly/react-core';
import { useChatBar } from '../ChatBarContext';
import { useTheme } from '../theme';
import RedHatLogo from '../../assets/images/RHLogo.svg';
import RedHatLogoWhite from '../../assets/images/RHLogo-white.svg';
import CompassBgLight from '../../assets/images/compass-bg-light.svg';
import CompassBgDark from '../../assets/images/compass-bg-dark.svg';
import { LayoutMessageBar } from './LayoutMessageBar';
import { LayoutNav } from './LayoutNav';
import { LayoutSidebarStart } from './LayoutSidebarStart';
import { LayoutSidebarEnd } from './LayoutSidebarEnd';
import './Layout.css';
import { THEME_DARK } from '../theme/ThemeContext';
import { UserAccountMenu } from '../user-account';
import { AppMenu } from './AppMenu';
import './Layout.css';
import { useDrawer } from '../drawer';

const PF_GLASS_THEME_CLASS = 'pf-v6-theme-glass';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { showChatBar } = useChatBar();
  const { theme } = useTheme();
  const { drawerState, closeDrawer } = useDrawer();
  const messageBarRef = useRef<HTMLTextAreaElement>(null);

  // add glass theme class to root
  useEffect(() => {
    document.documentElement.classList.add(PF_GLASS_THEME_CLASS);
    return () => {
      document.documentElement.classList.remove(PF_GLASS_THEME_CLASS);
    };
  }, []);

  // Header components
  const genieLogo = (
    <Brand
      src={theme === THEME_DARK ? RedHatLogoWhite : RedHatLogo}
      alt="Genie Logo"
      widths={{ default: '120px' }}
    />
  );

  const header = (
    <CompassHeader
      logo={genieLogo}
      nav={<LayoutNav />}
      profile={
        <>
          <AppMenu />
          <UserAccountMenu />
        </>
      }
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

  const panelContent = (
    <DrawerPanelContent>
      <DrawerHead>
        <div className="drawer-heading">
          {drawerState.icon ? (
            <Icon size="heading_2xl" className="drawer-heading__icon">
              {drawerState.icon}
            </Icon>
          ) : null}
          <span className="drawer-heading__text pf-v6-u-font-family-heading pf-v6-u-font-size-lg pf-v6-u-font-weight-bold">
            {drawerState.heading}
          </span>
        </div>
        <DrawerActions>
          <DrawerCloseButton onClick={closeDrawer} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>{drawerState.children}</DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Drawer
      isExpanded={drawerState.isOpen}
      position={drawerState.position}
      className={'genie-drawer'}
      isPill
    >
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <Compass
            className="genie-layout"
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
            backgroundSrcLight={CompassBgLight}
            backgroundSrcDark={CompassBgDark}
          >
            {children}
          </Compass>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
