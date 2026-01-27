import { useEffect, useState, useCallback, type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import {
  CompassPanel,
  ActionList,
  ActionListItem,
  ActionListGroup,
  Tooltip,
  Button,
} from '@patternfly/react-core';
import { CommentDotsIcon, RhUiCollectionIcon, PlusSquareIcon } from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import { ChatHistory } from '../ChatHistory';
import { mainGenieRoute, SubRoutes, ChatNew } from '../routeList';

export const LayoutSidebarStart: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { openDrawer } = useDrawer();
  const [activeItem, setActiveItem] = useState<string>('');

  const handleNewChatClick = useCallback(() => {
    navigate(`${mainGenieRoute}/${ChatNew}`);
  }, [navigate]);

  const handleChatHistoryClick = useCallback(() => {
    openDrawer({
      id: 'chat-history',
      heading: 'Chat History',
      icon: <CommentDotsIcon />,
      position: 'left',
      children: <ChatHistory />,
    });
  }, [openDrawer]);

  // Set the active item based on the current route path
  useEffect(() => {
    const urlSegments = pathname.split('/');
    const lastUrlItem = urlSegments.pop();
    setActiveItem(lastUrlItem || '');
  }, [pathname]);

  return (
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
};
