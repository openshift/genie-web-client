import { useCallback, type FunctionComponent } from 'react';
import { Button } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import type { ToolCallState } from '../../hooks/useChatMessages';
import { ToolsDrawerContent } from './ToolsDrawerContent';

export interface ToolCallsProps {
  toolCalls: ToolCallState[];
}

export const ToolCalls: FunctionComponent<ToolCallsProps> = ({ toolCalls }) => {
  const { drawerState, openDrawer, closeDrawer } = useDrawer();

  const handleClick = useCallback((): void => {
    if (drawerState.isOpen) {
      closeDrawer();
    } else {
      openDrawer({
        heading: 'Tools',
        icon: <InfoCircleIcon />,
        children: <ToolsDrawerContent toolCalls={toolCalls} />,
        position: 'right',
      });
    }
  }, [drawerState.isOpen, openDrawer, closeDrawer, toolCalls]);

  return (
    <Button
      variant="plain"
      size="sm"
      aria-label="View tools used"
      onClick={handleClick}
      icon={<InfoCircleIcon />}
    >
      Tools
    </Button>
  );
};
