import { useCallback, type FunctionComponent } from 'react';
import { Button } from '@patternfly/react-core';
import { RhUiLinkIcon } from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import { SourcesDrawerContent } from './SourcesDrawerContent';
import { useTranslation } from 'react-i18next';
import { ReferencedDocument } from 'src/hooks/AIState';

export interface SourcesProps {
  sources: ReferencedDocument[];
}

export const Sources: FunctionComponent<SourcesProps> = ({ sources }) => {
  const { openDrawer } = useDrawer();
  const { t } = useTranslation('plugin__genie-web-client');
  const handleClick = useCallback((): void => {
    openDrawer({
      id: 'sources',
      heading: t('chat.sources'),
      icon: <RhUiLinkIcon />,
      children: <SourcesDrawerContent sources={sources} />,
      position: 'right',
    });
  }, [openDrawer, sources, t]);

  return (
    <Button
      variant="link"
      onClick={handleClick}
      icon={<RhUiLinkIcon />}
      aria-label={t('chat.sources.ariaLabel')}
    >
      {t('chat.sources')}
    </Button>
  );
};
