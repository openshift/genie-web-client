import { useCallback, type FunctionComponent } from 'react';
import { Button } from '@patternfly/react-core';
import { RhUiInformationIcon } from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import type { ToolCallState } from 'src/utils/toolCallHelpers';
import { ToolsDrawerContent } from './ToolsDrawerContent';
import { useTranslation } from 'react-i18next';

export interface ToolCallsProps {
  toolCalls: ToolCallState[];
}

export const ToolCalls: FunctionComponent<ToolCallsProps> = ({ toolCalls }) => {
  const { openDrawer } = useDrawer();
  const { t } = useTranslation('plugin__genie-web-client');
  const handleClick = useCallback((): void => {
    openDrawer({
      id: 'tools',
      heading: t('chat.tools'),
      icon: <RhUiInformationIcon />,
      children: <ToolsDrawerContent toolCalls={toolCalls} />,
      position: 'right',
    });
  }, [openDrawer, toolCalls, t]);

  return (
    <Button
      variant="link"
      onClick={handleClick}
      icon={<RhUiInformationIcon />}
      aria-label={t('chat.tools.ariaLabel')}
    >
      {t('chat.tools')}
    </Button>
  );
};
