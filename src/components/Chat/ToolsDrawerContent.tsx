import { useState, type FunctionComponent } from 'react';
import {
  Stack,
  StackItem,
  Flex,
  FlexItem,
  ExpandableSection,
  CodeBlock,
  CodeBlockCode,
  Icon,
  Button,
} from '@patternfly/react-core';
import { RhUiAiExperienceIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ToolCallState } from 'src/utils/toolCallHelpers';

export interface ToolsDrawerContentProps {
  toolCalls: ToolCallState[];
}

/**
 * Format tool name for display (e.g., "resources_list" -> "Resources List")
 */
const formatToolName = (name: string): string => {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface ToolItemProps {
  toolCall: ToolCallState;
}

/**
 * Individual tool item displayed in the drawer.
 */
const ToolItem: FunctionComponent<ToolItemProps> = ({ toolCall }) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const [isExpanded, setIsExpanded] = useState(false);
  const displayName = formatToolName(toolCall.name);

  const formatResult = (result?: unknown): string => {
    if (result === undefined || result === null) {
      return 'No result yet';
    }
    if (typeof result === 'string') {
      return result;
    }
    return JSON.stringify(result, null, 2);
  };

  const hasDetails = toolCall.arguments;
  const toggleId = `tool-details-toggle-${toolCall.id}`;
  const contentId = `tool-details-content-${toolCall.id}`;

  return (
    <div className="tool-item drawer-item">
      <div className="icon-stub" />
      <span className="drawer-item__align-center pf-v6-u-font-family-heading pf-v6-u-font-weight-bold">
        {displayName}
      </span>
      {hasDetails && (
        <Button
          isInline
          variant="tertiary"
          className="drawer-item__col-2-span"
          id={toggleId}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? t('chat.tools.hideDetails') : t('chat.tools.details')}
        </Button>
      )}
      {hasDetails && (
        <ExpandableSection
          isExpanded={isExpanded}
          isDetached
          toggleId={toggleId}
          contentId={contentId}
          className="drawer-item__col-2-span"
        >
          <Stack hasGutter>
            {toolCall.arguments && (
              <StackItem>
                <span className="pf-v6-u-font-family-heading pf-v6-u-font-weight-bold">
                  {t('chat.tools.arguments')}
                </span>
                <CodeBlock className="pf-v6-u-mt-sm">
                  <CodeBlockCode className="drawer-code-block">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </CodeBlockCode>
                </CodeBlock>
              </StackItem>
            )}
            {toolCall.result !== undefined && (
              <StackItem>
                <span className="pf-v6-u-font-family-heading pf-v6-u-font-weight-bold">
                  {t('chat.tools.result')}
                </span>
                <CodeBlock className="pf-v6-u-mt-sm">
                  <CodeBlockCode className="drawer-code-block">
                    {formatResult(toolCall.result)}
                  </CodeBlockCode>
                </CodeBlock>
              </StackItem>
            )}
          </Stack>
        </ExpandableSection>
      )}
    </div>
  );
};

/**
 * Drawer content displaying the list of all tool calls used to generate an AI response.
 */
export const ToolsDrawerContent: FunctionComponent<ToolsDrawerContentProps> = ({ toolCalls }) => {
  const { t } = useTranslation('plugin__genie-web-client');

  return (
    <Stack hasGutter className="tools-drawer-content chat-drawer-content">
      <StackItem className="chat-drawer-content__header">
        <Flex flexWrap={{ default: 'nowrap' }}>
          <FlexItem>
            <Icon size="heading_2xl" className="chat-drawer-content__header__icon">
              <RhUiAiExperienceIcon />
            </Icon>
          </FlexItem>
          <FlexItem>
            <span className="pf-v6-u-font-size-sm">{t('chat.tools.description')}</span>
          </FlexItem>
        </Flex>
      </StackItem>
      {toolCalls.map((toolCall) => (
        <StackItem key={toolCall.id}>
          <ToolItem toolCall={toolCall} />
        </StackItem>
      ))}
    </Stack>
  );
};
