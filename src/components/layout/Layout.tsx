import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom-v5-compat';
import {
  Compass,
  Avatar,
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
  ImagesIcon,
  PlusSquareIcon,
  QuestionCircleIcon,
  SearchIcon,
  WaveSquareIcon,
} from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import { mainGenieRoute, SubRoutes, ChatNew } from '../routeList';
import { useChatBar } from '../ChatBarContext';
import RedHatLogo from '../../assets/images/RHLogo.svg';
import AvatarImg from '../../assets/images/avatar.svg';

import './Layout.css';
import Notifications from '../notifications/Notifications';
import { useSendMessage } from '@redhat-cloud-services/ai-react-state';
import { ChatHistory } from '../ChatHistory';
import { useDrawerFocusManagement } from './useDrawerFocusManagement';

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
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeItem, setActiveItem] = useState<string | number>(0);
  const { showChatBar } = useChatBar();
  const navigate = useNavigate();

  const sendMessage = useSendMessage();

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

  const onNavSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: {
      groupId: number | string;
      itemId: number | string;
      to: string;
    },
  ) => setActiveItem(selectedItem.itemId);

  const location = useLocation();

  // Set the active item based on the current route path
  useEffect(() => {
    const path = location.pathname;
    const urlSegments = path.split('/');
    const lastUrlItem = urlSegments.pop();
    setActiveItem(lastUrlItem as SubRoutes);
  }, [location.pathname]);

  // const isChatRoute = !!useMatch(`${mainGenieRoute}/${ChatNew}`);

  // Header components
  const genieLogo = <Brand src={RedHatLogo} alt="Genie Logo" widths={{ default: '120px' }} />;
  const userAccount = <Avatar src={AvatarImg} alt="User Account" />;

  const navContent = (
    <div className="global-layout-nav">
      <CompassPanel isPill>
        <Button
          variant="plain"
          icon={<HomeIcon />}
          aria-label="Home"
          onClick={() => navigate(mainGenieRoute)}
        />
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

  const header = <CompassHeader logo={genieLogo} nav={navContent} profile={userAccount} />;

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
                onClick={() => navigate(`${mainGenieRoute}/${ChatNew}`)}
              />
            </Tooltip>
          </ActionListItem>
          <ActionListItem>
            <Tooltip content="Chat History">
              <Button
                variant="plain"
                icon={<CommentDotsIcon />}
                aria-label="Chat History"
                onClick={() => handleDrawerOpen('chatHistory')}
              />
            </Tooltip>
          </ActionListItem>
        </ActionListGroup>
        <ActionListItem>
          <Tooltip content="Library">
            <Button variant="plain" icon={<ImagesIcon />} aria-label="Library" />
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
            <Tooltip content="Notifications">
              <Button
                variant="plain"
                icon={<BellIcon />}
                aria-label="Notifications"
                onClick={() => handleDrawerOpen('notifications')}
              />
            </Tooltip>
          </ActionListItem>
          <ActionListItem>
            <Tooltip content="Activity">
              <Button
                variant="plain"
                icon={<WaveSquareIcon />}
                aria-label="Activity"
                onClick={() => handleDrawerOpen('activity')}
              />
            </Tooltip>
          </ActionListItem>
          <ActionListItem>
            <Tooltip content="Help">
              <Button
                variant="plain"
                icon={<QuestionCircleIcon />}
                aria-label="Help"
                onClick={() => handleDrawerOpen('help')}
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
          <MessageBar
            ref={messageBarRef}
            onSendMessage={(value: string) => {
              sendMessage(value, { stream: true, requestOptions: {} });
              navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
            }}
          />
        </CompassPanel>
      </CompassMessageBar>
    </CompassMainFooter>
  );

  const drawerContent = drawerState.isOpen ? (
    <DrawerPanelContent>
      <DrawerHead>
        <div className="drawer-heading">
          {drawerState.icon && <span className="drawer-heading__icon">{drawerState.icon}</span>}
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
    >
      {children}
    </Compass>
  );
};
