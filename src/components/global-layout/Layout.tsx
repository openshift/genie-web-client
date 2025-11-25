import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
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
} from '@patternfly/react-core';
import { MessageBar } from '@patternfly/chatbot';
import {
  BellIcon,
  CommentDotsIcon,
  HomeIcon,
  ImagesIcon,
  PlusSquareIcon,
  OptimizeIcon,
  QuestionCircleIcon,
  SearchIcon,
  WaveSquareIcon,
} from '@patternfly/react-icons';
import RedHatLogo from '../../assets/images/RHLogo.svg';
import AvatarImg from '../../assets/images/avatar.svg';
import { useDrawer } from '../global-drawer';
import './Layout.css';
import AppEmptyState from '../empty-state/EmptyState';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeItem, setActiveItem] = useState<string | number>(0);

  const { drawerState, openDrawer, closeDrawer } = useDrawer();

  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('genieUserName');
      if (storedName && typeof storedName === 'string') {
        setUserName(storedName);
      }
    } catch {
      // local storage not available
    }
  }, []);

  const handleDrawerOpen = useCallback(
    (configKey: 'chatHistory' | 'notifications' | 'activity' | 'help') => {
      const config = {
        chatHistory: {
          heading: 'Chat History',
          icon: <CommentDotsIcon />,
          position: 'left' as const,
          children: (
            <div>
              <p>This is content in the left drawer.</p>
              <p>You can put any React components here.</p>
            </div>
          ),
          onClose: () => console.log('Chat history closed'),
        },
        notifications: {
          heading: 'Notifications',
          icon: <BellIcon />,
          position: 'right' as const,
          children: (
            <div>
              <p>This is content in the right drawer.</p>
              <p>You can put any React components here.</p>
            </div>
          ),
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
    [openDrawer],
  );

  const onNavSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: {
      groupId: number | string;
      itemId: number | string;
      to: string;
    },
  ) => setActiveItem(selectedItem.itemId);

  // Header components
  const genieLogo = <Brand src={RedHatLogo} alt="Genie Logo" widths={{ default: '120px' }} />;
  const userAccount = <Avatar src={AvatarImg} alt="User Account" />;

  const navContent = (
    <div className="global-layout-nav">
      <CompassPanel isPill>
        <Button variant="plain" icon={<HomeIcon />} aria-label="Home" />
        <Nav onSelect={onNavSelect} aria-label="Nav" variant="horizontal">
          <NavList>
            <NavItem preventDefault itemId={1} isActive={activeItem === 1} to="#">
              AI & Automation
            </NavItem>
            <NavItem preventDefault itemId={2} isActive={activeItem === 2} to="#">
              Infrastructure
            </NavItem>
            <NavItem preventDefault itemId={3} isActive={activeItem === 3} to="#">
              Insights
            </NavItem>
            <NavItem preventDefault itemId={4} isActive={activeItem === 4} to="#">
              Security
            </NavItem>
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
              <Button variant="plain" icon={<PlusSquareIcon />} aria-label="New Chat" />
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

  // Show empty state only if a username exists; otherwise render an empty container
  const mainContent = userName ? (
    <div className="global-layout-empty-state">
      <AppEmptyState
        heading={`Every dashboard tells a story. What will yours say, ${userName}?`}
        description={
          <>
            Begin with Genie — transform your OpenShift data into insight, and insight into action.
          </>
        }
        primaryAction={{
          label: 'Create your first dashboard',
          onClick: () => console.log('Start your first chat'),
          icon: <OptimizeIcon />,
        }}
      />
    </div>
  ) : (
    <></>
  );

  // Footer component
  const footer = (
    <CompassMessageBar>
      <CompassPanel isPill hasNoPadding>
        <MessageBar
          onSendMessage={(message: string | number) => {
            console.log(message);
          }}
        />
      </CompassPanel>
    </CompassMessageBar>
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
      main={mainContent}
      footer={footer}
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
