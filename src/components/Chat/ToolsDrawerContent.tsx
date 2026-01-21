import type { FunctionComponent } from 'react';
import {
  Stack,
  StackItem,
  Label,
  Divider,
  Flex,
  FlexItem,
  ExpandableSection,
  CodeBlock,
  CodeBlockCode,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  InProgressIcon,
  CubesIcon,
  RhUiAiExperienceIcon,
} from '@patternfly/react-icons';
import type { ToolCallState } from '../../hooks/useChatMessages';

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
  const isCompleted = toolCall.status === 'completed';
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

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
          <FlexItem>
            <CubesIcon />
          </FlexItem>
          <FlexItem grow={{ default: 'grow' }}>
            <strong>{displayName}</strong>
          </FlexItem>
          <FlexItem>
            {isCompleted ? (
              <Label color="green" icon={<CheckCircleIcon />} isCompact>
                Completed
              </Label>
            ) : (
              <Label color="blue" icon={<InProgressIcon />} isCompact>
                Running
              </Label>
            )}
          </FlexItem>
        </Flex>
      </StackItem>

      {toolCall.arguments ? (
        <StackItem>
          <ExpandableSection toggleText="Arguments" isIndented>
            <CodeBlock>
              <CodeBlockCode>{JSON.stringify(toolCall.arguments, null, 2)}</CodeBlockCode>
            </CodeBlock>
          </ExpandableSection>
        </StackItem>
      ) : null}

      {isCompleted && toolCall.result !== undefined ? (
        <StackItem>
          <ExpandableSection toggleText="Result" isIndented>
            <CodeBlock>
              <CodeBlockCode>{formatResult(toolCall.result)}</CodeBlockCode>
            </CodeBlock>
          </ExpandableSection>
        </StackItem>
      ) : null}
    </Stack>
  );
};

/**
 * Drawer content displaying the list of all tool calls used to generate an AI response.
 */
export const ToolsDrawerContent: FunctionComponent<ToolsDrawerContentProps> = ({ toolCalls }) => {
  return (
    <Stack hasGutter>
      <StackItem>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'flex-start' }}>
          <RhUiAiExperienceIcon style={{ fontSize: '24px', flexShrink: 0 }} />
          <p className="pf-v6-u-font-size-sm" style={{ margin: 0 }}>
            The following tools were used to generate this AI response and assist in providing
            supporting information:
          </p>
        </div>
      </StackItem>

      <StackItem>
        <Divider />
      </StackItem>

      {toolCalls.map((toolCall) => (
        <StackItem key={toolCall.id}>
          <ToolItem toolCall={toolCall} />
          <Divider className="pf-v6-u-mt-md" />
        </StackItem>
      ))}
    </Stack>
  );
};
