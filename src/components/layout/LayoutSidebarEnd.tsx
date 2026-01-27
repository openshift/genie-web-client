import { useCallback, type FC } from 'react';
import {
  CompassPanel,
  ActionList,
  ActionListItem,
  ActionListGroup,
  Tooltip,
  Button,
} from '@patternfly/react-core';
import { BellIcon, QuestionCircleIcon, WaveSquareIcon } from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import { ThemeToggle } from '../theme';
import { Notifications } from '../notifications/Notifications';

export const LayoutSidebarEnd: FC = () => {
  const { openDrawer } = useDrawer();

  const handleNotificationsClick = useCallback(() => {
    openDrawer({
      id: 'notifications',
      heading: 'Notifications',
      icon: <BellIcon />,
      position: 'right',
      children: <Notifications />,
    });
  }, [openDrawer]);

  const handleActivityClick = useCallback(() => {
    openDrawer({
      id: 'activity',
      heading: 'Activity',
      icon: <WaveSquareIcon />,
      position: 'right',
      children: (
        <div>
          <p>This is content in the right drawer.</p>
          <p>You can put any React components here.</p>
        </div>
      ),
    });
  }, [openDrawer]);

  const handleHelpClick = useCallback(() => {
    openDrawer({
      id: 'help',
      heading: 'Help',
      icon: <QuestionCircleIcon />,
      position: 'right',
      children: (
        <div>
          <p>This is content in the right drawer.</p>
          <p>You can put any React components here.</p>
        </div>
      ),
    });
  }, [openDrawer]);

  return (
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
};
