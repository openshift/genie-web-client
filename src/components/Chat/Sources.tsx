import { useCallback, type FunctionComponent } from 'react';
import { Button } from '@patternfly/react-core';
import { RhUiLinkIcon } from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import { SourcesDrawerContent } from './SourcesDrawerContent';
import { useTranslation } from 'react-i18next';

export interface ReferencedDocument {
  doc_url: string;
  doc_title: string;
}

export interface SourcesProps {
  sources: ReferencedDocument[];
}

export const Sources: FunctionComponent<SourcesProps> = ({ sources }) => {
  const { drawerState, openDrawer, closeDrawer } = useDrawer();
  const { t } = useTranslation('plugin__genie-web-client');
  const handleClick = useCallback((): void => {
    if (drawerState.isOpen) {
      closeDrawer();
    } else {
      openDrawer({
        heading: t('chat.sources'),
        icon: <RhUiLinkIcon />,
        children: <SourcesDrawerContent sources={sources} />,
        position: 'right',
      });
    }
  }, [drawerState.isOpen, openDrawer, closeDrawer, sources]);

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
