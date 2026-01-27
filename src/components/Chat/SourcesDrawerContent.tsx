import { type FunctionComponent } from 'react';
import { Stack, StackItem, Flex, FlexItem, Icon } from '@patternfly/react-core';
import { RhUiAiExperienceIcon } from '@patternfly/react-icons';
import { ReferencedDocument } from 'src/hooks/AIState';
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
      <img src={faviconUrl} alt="" className="source-item__favicon" />
      <span className="pf-v6-u-font-size-xs pf-v6-u-text-color-subtle">{hostname}</span>
      <span className="pf-v6-u-font-family-heading pf-v6-u-font-weight-bold drawer-item__col-2 ">
        {source.doc_title}
      </span>
    </a>
  );
};

export const SourcesDrawerContent: FunctionComponent<SourcesDrawerContentProps> = ({ sources }) => {
  const { t } = useTranslation('plugin__genie-web-client');
  return (
    <Stack hasGutter className="chat-drawer-content sources-drawer-content">
      <StackItem className="chat-drawer-content__header">
        <Flex flexWrap={{ default: 'nowrap' }}>
          <FlexItem>
            <Icon size="heading_2xl" className="chat-drawer-content__header__icon">
              <RhUiAiExperienceIcon />
            </Icon>
          </FlexItem>
          <FlexItem>
            <span className="pf-v6-u-font-size-sm">{t('chat.sources.description')}</span>
          </FlexItem>
        </Flex>
      </StackItem>
      {sources.map((source, index) => (
        <StackItem key={`${source.doc_url}-${index}`}>
          <SourceItem source={source} />
        </StackItem>
      ))}
    </Stack>
  );
};
