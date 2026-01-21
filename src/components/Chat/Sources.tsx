import { useCallback, type FunctionComponent } from 'react';
import { Button } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';
import { useDrawer } from '../drawer';
import { SourcesDrawerContent } from './SourcesDrawerContent';

export interface ReferencedDocument {
  doc_url: string;
  doc_title: string;
}

export interface SourcesProps {
  sources: ReferencedDocument[];
}

export const Sources: FunctionComponent<SourcesProps> = ({ sources }) => {
  const { drawerState, openDrawer, closeDrawer } = useDrawer();

  const handleClick = useCallback((): void => {
    if (drawerState.isOpen) {
      closeDrawer();
    } else {
      openDrawer({
        heading: 'Sources',
        icon: <LinkIcon />,
        children: <SourcesDrawerContent sources={sources} />,
        position: 'right',
      });
    }
  }, [drawerState.isOpen, openDrawer, closeDrawer, sources]);

  return (
    <Button
      variant="plain"
      size="sm"
      aria-label="View sources"
      onClick={handleClick}
      icon={<LinkIcon />}
    >
      Sources
    </Button>
  );
};
