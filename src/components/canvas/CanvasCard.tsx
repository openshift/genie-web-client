import React, { useCallback, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Content,
  ContentVariants,
  Label,
  Timestamp,
} from '@patternfly/react-core';
import { RhUiCatalogIcon, RhUiCodeIcon, RhUiCollectionIcon } from '@patternfly/react-icons';
import type { Artifact } from '../../types/chat';
import './CanvasCard.css';

export interface CanvasCardProps {
  artifactId: string;
  title: string;
  type: Artifact['type'];
  lastModified: Date;
  isViewing?: boolean;
  onOpen: (artifactId: string) => void;
}

const getArtifactIcon = (type: Artifact['type']): ReactNode => {
  switch (type) {
    case 'dashboard':
      return <RhUiCatalogIcon />;
    case 'code':
      return <RhUiCodeIcon />;
    case 'widget':
    default:
      return <RhUiCollectionIcon />;
  }
};

export const CanvasCard: React.FC<CanvasCardProps> = ({
  artifactId,
  title,
  type,
  lastModified,
  isViewing = false,
  onOpen,
}) => {
  const { t } = useTranslation('plugin__genie-web-client');

  // don't fire click when already viewing since card is disabled
  const handleOpen = useCallback(() => {
    if (!isViewing) {
      onOpen(artifactId);
    }
  }, [onOpen, artifactId, isViewing]);

  // aria label changes based on viewing state to tell screen readers what'll happen on click
  const cardAriaLabel = useMemo(
    () =>
      isViewing
        ? t('canvasCard.viewingAriaLabel', { title: title || t('canvasCard.untitled') })
        : t('canvasCard.openAriaLabel', { title: title || t('canvasCard.untitled') }),
    [t, title, isViewing],
  );

  return (
    <Card
      isCompact
      isClickable
      isClicked={isViewing}
      isDisabled={isViewing}
      variant="secondary"
      className="canvas-card"
    >
      <CardHeader
        selectableActions={{
          onClickAction: handleOpen,
          selectableActionAriaLabel: cardAriaLabel,
        }}
      >
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
          <FlexItem className="canvas-card__icon">{getArtifactIcon(type)}</FlexItem>
          <FlexItem className="canvas-card__details" grow={{ default: 'grow' }}>
            <CardTitle>{title || t('canvasCard.untitled')}</CardTitle>
            <Content component={ContentVariants.small} className="canvas-card__metadata">
              {t(`canvasCard.type.${type}`)} •{' '}
              <Timestamp
                date={lastModified}
                dateFormat="short"
                timeFormat="short"
                is12Hour={true}
              />
            </Content>
          </FlexItem>
          {isViewing && (
            <FlexItem>
              <Label color="blue" isCompact>
                {t('canvasCard.viewing')}
              </Label>
            </FlexItem>
          )}
        </Flex>
      </CardHeader>
    </Card>
  );
};
