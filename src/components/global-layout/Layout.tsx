import * as React from 'react';
import { useState } from 'react';
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
} from '@patternfly/react-core';
import { MessageBar } from '@patternfly/chatbot';
import {
  BellIcon,
  CogIcon,
  CommentDotsIcon,
  CommentIcon,
  HomeIcon,
  ImagesIcon,
  PlusSquareIcon,
  QuestionCircleIcon,
  SearchIcon,
  WaveSquareIcon,
} from '@patternfly/react-icons';
import RedHatLogo from '../../assets/images/RHLogo.svg';
import AvatarImg from '../../assets/images/avatar.svg';
import './Layout.css';
import { useDrawer } from '../global-drawer';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeItem, setActiveItem] = useState<string | number>(0);

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

  const onNavSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: {
      groupId: number | string;
      itemId: number | string;
      to: string;
    }
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

  const header = (
    <CompassHeader logo={genieLogo} nav={navContent} profile={userAccount} />
  );

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
              <Button variant="plain" icon={<CommentDotsIcon />} aria-label="Chat History" onClick={handleOpenLeftDrawer} />
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
              <Button variant="plain" icon={<BellIcon />} aria-label="Notifications" onClick={handleOpenRightDrawer} />
            </Tooltip>
          </ActionListItem>
          <ActionListItem>
            <Tooltip content="Activity">
              <Button variant="plain" icon={<WaveSquareIcon />} aria-label="Activity" />
            </Tooltip>
          </ActionListItem>
          <ActionListItem>
            <Tooltip content="Help">
              <Button variant="plain" icon={<QuestionCircleIcon />} aria-label="Help" />
            </Tooltip>
          </ActionListItem>
        </ActionListGroup>
      </ActionList>
    </CompassPanel>
  );

  const mainContent = <></>;

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

  return (
    <Compass
      header={header}
      isHeaderExpanded={true}
      sidebarStart={sidebarStart}
      sidebarEnd={sidebarEnd}
      main={mainContent}
      footer={footer}
    >
      {children}
    </Compass>
  );
};
