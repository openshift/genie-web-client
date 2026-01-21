import type { FunctionComponent } from 'react';
import {
  Stack,
  StackItem,
  Divider,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, RhUiAiExperienceIcon } from '@patternfly/react-icons';
import type { ReferencedDocument } from './Sources';

export interface SourcesDrawerContentProps {
  sources: ReferencedDocument[];
}

interface SourceItemProps {
  source: ReferencedDocument;
}

const SourceItem: FunctionComponent<SourceItemProps> = ({ source }) => {
  return (
    <a
      href={source.doc_url}
      target="_blank"
      rel="noopener noreferrer"
      className="pf-v6-u-text-decoration-none"
    >
      <Flex
        alignItems={{ default: 'alignItemsFlexStart' }}
        gap={{ default: 'gapMd' }}
        className="pf-v6-u-py-sm"
      >
        <FlexItem>
          <div className="pf-v6-u-background-color-200 pf-v6-u-p-sm">
            <ExternalLinkAltIcon />
          </div>
        </FlexItem>
        <FlexItem grow={{ default: 'grow' }}>
          <Stack>
            <StackItem>
              <span className="pf-v6-u-font-size-xs pf-v6-u-color-200">
                {new URL(source.doc_url).hostname}
              </span>
            </StackItem>
            <StackItem>
              <strong className="pf-v6-u-font-size-sm">{source.doc_title}</strong>
            </StackItem>
          </Stack>
        </FlexItem>
      </Flex>
    </a>
  );
};

export const SourcesDrawerContent: FunctionComponent<SourcesDrawerContentProps> = ({ sources }) => {
  return (
    <Stack hasGutter>
      <StackItem>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'flex-start' }}>
          <RhUiAiExperienceIcon style={{ fontSize: '24px', flexShrink: 0 }} />
          <p className="pf-v6-u-font-size-sm" style={{ margin: 0 }}>
            The following sources were used to generate this AI response and provide supporting
            information:
          </p>
        </div>
      </StackItem>

      <StackItem>
        <Divider />
      </StackItem>

      {sources.map((source, index) => (
        <StackItem key={`${source.doc_url}-${index}`}>
          <SourceItem source={source} />
          {index < sources.length - 1 ? <Divider className="pf-v6-u-mt-sm" /> : null}
        </StackItem>
      ))}
    </Stack>
  );
};
