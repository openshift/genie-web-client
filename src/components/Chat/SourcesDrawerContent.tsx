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
  const hostname = new URL(source.doc_url).hostname;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

  return (
    <a
      href={source.doc_url}
      target="_blank"
      rel="noopener noreferrer"
      className="source-item drawer-item"
    >
      <img src={faviconUrl} alt="" width={16} height={16} className="source-favicon" />
      <span className="pf-v6-u-font-size-xs pf-v6-u-text-color-subtle">
        {hostname}
      </span>
      <span className="pf-v6-u-font-family-heading pf-v6-u-font-weight-bold drawer-item__col-2 ">
        {source.doc_title}
      </span>
    </a>
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
