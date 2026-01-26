import { useCallback, type FunctionComponent } from 'react';
import { Button } from '@patternfly/react-core';
import { RhUiInformationIcon } from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import type { ToolCallState } from '../../hooks/useChatMessages';
import { ToolsDrawerContent } from './ToolsDrawerContent';
import { useTranslation } from 'react-i18next';

export interface ToolCallsProps {
  toolCalls: ToolCallState[];
}

export const ToolCalls: FunctionComponent<ToolCallsProps> = ({ toolCalls }) => {
  const { drawerState, openDrawer, closeDrawer } = useDrawer();
  const { t } = useTranslation('plugin__genie-web-client');
  const handleClick = useCallback((): void => {
    if (drawerState.isOpen) {
      closeDrawer();
    } else {
      openDrawer({
        heading: t('chat.tools'),
        icon: <RhUiInformationIcon />,
        children: <ToolsDrawerContent toolCalls={toolCalls} />,
        position: 'right',
      });
    }
  }, [drawerState.isOpen, openDrawer, closeDrawer, toolCalls]);

  return (
    <Button variant="link" onClick={handleClick} icon={<RhUiInformationIcon />} aria-label={t('chat.tools.ariaLabel')}>
      {t('chat.tools')} 
    </Button>
  );
};
