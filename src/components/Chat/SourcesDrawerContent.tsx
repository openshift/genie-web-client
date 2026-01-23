import { type FunctionComponent } from 'react';
import {
  Stack,
  StackItem,
  Divider,
  Flex,
  FlexItem,
  Icon,
} from '@patternfly/react-core';
import { RhUiAiExperienceIcon } from '@patternfly/react-icons';
import type { ReferencedDocument } from './Sources';
import './SourcesDrawerContent.css';
import { useTranslation } from 'react-i18next';

export interface SourcesDrawerContentProps {
  sources: ReferencedDocument[];
}

interface SourceItemProps {
  source: ReferencedDocument;
}

const SourceItem: FunctionComponent<SourceItemProps> = ({ source }) => {
  return (
    <div className="source-item">
        <div className="icon-stub" />
      <span className="pf-v6-u-font-size-xs pf-v6-u-text-color-subtle">
          {new URL(source.doc_url).hostname}
        </span>
        <span className="source-item__title pf-v6-u-font-family-heading pf-v6-u-font-weight-bold">{source.doc_title}</span>
    </div>
  );
};

export const SourcesDrawerContent: FunctionComponent<SourcesDrawerContentProps> = ({ sources }) => {
  const { t } = useTranslation('plugin__genie-web-client');
  return (
    <Stack hasGutter className="sources-drawer-content">
      <StackItem className="sources-drawer-content__header">
        <Flex flexWrap={{ default: 'nowrap' }}>
          <FlexItem>
            <Icon size="heading_2xl" className='sources-drawer-content__header__icon'>
              <RhUiAiExperienceIcon />
            </Icon>
          </FlexItem>
          <FlexItem>
            <span className="pf-v6-u-font-size-sm">
              {t('chat.sources.description')}
            </span>
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem>
        <Divider />
      </StackItem>
      {sources.map((source, index) => (
        <StackItem key={`${source.doc_url}-${index}`}>
          <SourceItem source={source} />
        </StackItem>
      ))}
    </Stack>
  );
};
