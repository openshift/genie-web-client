import { useCallback, useEffect, useRef, useState, ReactNode, FormEvent } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom-v5-compat';
import {
  Compass,
  Brand,
  CompassHeader,
  CompassPanel,
  Nav,
  NavItem,
  NavList,
  ActionList,
  ActionListItem,
  ActionListGroup,
  Tooltip,
  Button,
  CompassMessageBar,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  CompassContent,
  CompassMainFooter,
} from '@patternfly/react-core';
import { MessageBar } from '@patternfly/chatbot';
import {
  BellIcon,
  CommentDotsIcon,
  HomeIcon,
  RhUiCollectionIcon,
  PlusSquareIcon,
  QuestionCircleIcon,
  SearchIcon,
  WaveSquareIcon,
} from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import { mainGenieRoute, SubRoutes, ChatNew } from '../routeList';
import { useChatBar } from '../ChatBarContext';
import { ThemeToggle, useTheme } from '../theme';
import RedHatLogo from '../../assets/images/RHLogo.svg';
import RedHatLogoWhite from '../../assets/images/RHLogo-white.svg';
import CompassBgLight from '../../assets/images/compass-bg-light.svg';
import CompassBgDark from '../../assets/images/compass-bg-dark.svg';

import { useSendStreamMessage } from '../../hooks/AIState';
import { ChatHistory } from '../ChatHistory';
import { Notifications } from '../notifications/Notifications';
import { useDrawerFocusManagement } from './useDrawerFocusManagement';
import { THEME_DARK } from '../theme/ThemeContext';
import { UserAccountMenu } from '../user-account';
import { AppMenu } from './AppMenu';
import './Layout.css';

const CreateNavItem = ({
  subRoute,
  title,
  activeItem,
}: {
  subRoute: SubRoutes;
  title: string;
  activeItem: string | number;
}) => {
  const navigate = useNavigate();
  return (
    <NavItem
      preventDefault
      itemId={subRoute}
      isActive={activeItem === subRoute}
      to={`${mainGenieRoute}/${subRoute}`}
      onClick={() => navigate(`${mainGenieRoute}/${subRoute}`)}
    >
      {title}
    </NavItem>
  );
};

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [activeItem, setActiveItem] = useState<string | number>(0);
  const { showChatBar } = useChatBar();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const sendStreamMessage = useSendStreamMessage();

  const { drawerState, openDrawer, closeDrawer } = useDrawer();

  const messageBarRef = useRef<HTMLTextAreaElement>(null);

  // Manage drawer focus: focus close button on open, handle Escape key, restore focus on close
  const { storeTriggerElement } = useDrawerFocusManagement({
    drawerState,
    closeDrawer,
  });

  const handleDrawerOpen = useCallback(
    (configKey: 'chatHistory' | 'notifications' | 'activity' | 'help') => {
      // Store the trigger element for focus restoration when drawer closes
      storeTriggerElement(configKey);

      const config = {
        chatHistory: {
          heading: 'Chat History',
          icon: <CommentDotsIcon />,
          position: 'left' as const,
          children: <ChatHistory />,
          onClose: () => console.log('Chat history closed'),
        },
        notifications: {
          heading: 'Notifications',
          icon: <BellIcon />,
          position: 'right' as const,
          children: <Notifications />,
          onClose: () => console.log('Notifications closed'),
        },
        activity: {
          heading: 'Activity',
          icon: <WaveSquareIcon />,
          position: 'right' as const,
          children: (
            <div>
              <p>This is content in the right drawer.</p>
              <p>You can put any React components here.</p>
            </div>
          ),
          onClose: () => console.log('Activity closed'),
        },
        help: {
          heading: 'Help',
          icon: <QuestionCircleIcon />,
          position: 'right' as const,
          children: (
            <div>
              <p>This is content in the right drawer.</p>
              <p>You can put any React components here.</p>
            </div>
          ),
          onClose: () => console.log('Help closed'),
        },
      }[configKey];
      if (config) {
        openDrawer(config);
      }
    },
    [openDrawer, storeTriggerElement],
  );

  const handleHomeClick = useCallback(() => {
    navigate(mainGenieRoute);
  }, [navigate]);

  const handleSendMessage = useCallback(
    (value: string) => {
      sendStreamMessage(value);
      navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
    },
    [sendStreamMessage, navigate],
  );

  const handleNewChatClick = useCallback(() => {
    navigate(`${mainGenieRoute}/${ChatNew}`);
  }, [navigate]);

  const handleChatHistoryClick = useCallback(() => {
    handleDrawerOpen('chatHistory');
  }, [handleDrawerOpen]);

  const handleNotificationsClick = useCallback(() => {
    handleDrawerOpen('notifications');
  }, [handleDrawerOpen]);

  const handleActivityClick = useCallback(() => {
    handleDrawerOpen('activity');
  }, [handleDrawerOpen]);

  const handleHelpClick = useCallback(() => {
    handleDrawerOpen('help');
  }, [handleDrawerOpen]);

  const onNavSelect = (
    _event: FormEvent<HTMLInputElement>,
    selectedItem: {
      groupId: number | string;
      itemId: number | string;
      to: string;
    },
  ): void => {
    setActiveItem(selectedItem.itemId);
  };

  const location = useLocation();

  // Set the active item based on the current route path
  useEffect(() => {
    const path = location.pathname;
    const urlSegments = path.split('/');
    const lastUrlItem = urlSegments.pop();
    setActiveItem(lastUrlItem as SubRoutes);
  }, [location.pathname]);

  // add glass theme class to root
  useEffect(() => {
    document.documentElement.classList.add('pf-v6-theme-glass');
    return () => {
      document.documentElement.classList.remove('pf-v6-theme-glass');
    };
  }, []);

  // const isChatRoute = !!useMatch(`${mainGenieRoute}/${ChatNew}`);

  // Header components
  const genieLogo = (
    <Brand
      src={theme === THEME_DARK ? RedHatLogoWhite : RedHatLogo}
      alt="Genie Logo"
      widths={{ default: '120px' }}
    />
  );

  const navContent = (
    <div className="global-layout-nav">
      <CompassPanel isPill>
        <Button variant="plain" icon={<HomeIcon />} aria-label="Home" onClick={handleHomeClick} />
        <Nav onSelect={onNavSelect} aria-label="Nav" variant="horizontal">
          <NavList>
            <CreateNavItem
              subRoute={SubRoutes.AIandAutomation}
              title="AI & Automation"
              activeItem={activeItem}
            />

            <CreateNavItem
              subRoute={SubRoutes.Infrastructure}
              title="Infrastructure"
              activeItem={activeItem}
            />

            <CreateNavItem subRoute={SubRoutes.Insights} title="Insights" activeItem={activeItem} />

            <CreateNavItem subRoute={SubRoutes.Security} title="Security" activeItem={activeItem} />
          </NavList>
        </Nav>
        <Button variant="plain" icon={<SearchIcon />} aria-label="Search" />
      </CompassPanel>
    </div>
  );

  const header = (
    <CompassHeader
      logo={genieLogo}
      nav={navContent}
      profile={
        <>
          <AppMenu /> <UserAccountMenu />
        </>
      }
    />
  );

  // Sidebar components
  const sidebarStart = (
    <CompassPanel isPill>
      <ActionList isIconList isVertical>
        <ActionListGroup>
          <ActionListItem>
            <Tooltip content="New Chat">
              <Button
                variant="plain"
                icon={<PlusSquareIcon />}
                aria-label="New Chat"
                onClick={handleNewChatClick}
              />
            </Tooltip>
          </ActionListItem>
          <ActionListItem>
            <Tooltip content="Chat History">
              <Button
                variant="plain"
                icon={<CommentDotsIcon />}
                aria-label="Chat History"
                onClick={handleChatHistoryClick}
              />
            </Tooltip>
          </ActionListItem>
        </ActionListGroup>
        <ActionListItem>
          <Tooltip content="Library">
            <Button
              variant="plain"
              icon={<RhUiCollectionIcon />}
              aria-label="Library"
              onClick={() => navigate(`${mainGenieRoute}/${SubRoutes.Library}`)}
              className={activeItem === SubRoutes.Library ? 'pf-m-current' : ''}
            />
          </Tooltip>
        </ActionListItem>
      </ActionList>
    </CompassPanel>
  );

  const sidebarEnd = (
    <CompassPanel isPill>
      <ActionList isIconList isVertical>
        <ActionListGroup>
          <ActionListItem>
            <ThemeToggle />
          </ActionListItem>
          <ActionListItem>
            <Tooltip content="Notifications">
              <Button
                variant="plain"
                icon={<BellIcon />}
                aria-label="Notifications"
                onClick={handleNotificationsClick}
              />
            </Tooltip>
          </ActionListItem>
          <ActionListItem>
            <Tooltip content="Activity">
              <Button
                variant="plain"
                icon={<WaveSquareIcon />}
                aria-label="Activity"
                onClick={handleActivityClick}
              />
            </Tooltip>
          </ActionListItem>
          <ActionListItem>
            <Tooltip content="Help">
              <Button
                variant="plain"
                icon={<QuestionCircleIcon />}
                aria-label="Help"
                onClick={handleHelpClick}
              />
            </Tooltip>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </CompassPanel>
  );

  // Footer component
  const footer = (
    <CompassMainFooter>
      <CompassMessageBar>
        <CompassPanel isPill hasNoPadding>
          <MessageBar ref={messageBarRef} onSendMessage={handleSendMessage} />
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
      sidebarStart={sidebarStart}
      sidebarEnd={sidebarEnd}
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
      backgroundSrcLight={CompassBgLight}
      backgroundSrcDark={CompassBgDark}
    >
      {children}
    </Compass>
  );
};
