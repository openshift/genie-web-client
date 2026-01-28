import { useState, type FunctionComponent } from 'react';
import {
  Stack,
  StackItem,
  Flex,
  FlexItem,
  ExpandableSection,
  ExpandableSectionToggle,
  CodeBlock,
  CodeBlockCode,
  Icon,
  Label,
  ProgressStepper,
  ProgressStep,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import {
  RhUiAiExperienceIcon,
  CheckCircleIcon,
  WarningTriangleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ToolCallState } from 'src/utils/toolCallHelpers';
import './ToolsDrawerContent.css';

export interface ToolsDrawerContentProps {
  toolCalls: ToolCallState[];
}

/** Maximum lines to display in code blocks before truncation */
const CODE_BLOCK_MAX_LINES = 5;

/**
 * Format tool name for display (e.g., "resources_list" -> "Resources List")
 */
const formatToolName = (name: string): string => {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format result for display.
 * If the result is a JSON string, parse and pretty-print it.
 */
const formatResult = (result?: unknown): string => {
  if (result === undefined || result === null) {
    return 'No result yet';
  }
  if (typeof result === 'string') {
    // Try to parse as JSON and pretty-print it
    try {
      const parsed = JSON.parse(result);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Not valid JSON, return as-is
      return result;
    }
  }
  return JSON.stringify(result, null, 2);
};

/**
 * Get the appropriate icon for a tool call status
 */
const getStatusIcon = (status: ToolCallState['status']): React.ReactNode => {
  switch (status) {
    case 'success':
      return <CheckCircleIcon />;
    case 'failure':
      return <WarningTriangleIcon />;
    case 'running':
    default:
      return <InProgressIcon />;
  }
};

/**
 * Get the appropriate variant for ProgressStep based on status
 */
const getStepVariant = (
  status: ToolCallState['status'],
): 'success' | 'danger' | 'info' | 'default' => {
  switch (status) {
    case 'success':
      return 'success';
    case 'failure':
      return 'danger';
    case 'running':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Get the label color based on status
 */
const getLabelColor = (status: ToolCallState['status']): 'green' | 'red' | 'blue' | 'grey' => {
  switch (status) {
    case 'success':
      return 'green';
    case 'failure':
      return 'red';
    case 'running':
      return 'blue';
    default:
      return 'grey';
  }
};

/**
 * Split content into visible portion and expandable portion
 */
const splitContentAtLine = (
  content: string,
  maxLines: number,
): { visible: string; expandable: string } => {
  const lines = content.split('\n');
  if (lines.length <= maxLines) {
    return { visible: content, expandable: '' };
  }
  return {
    visible: lines.slice(0, maxLines).join('\n'),
    expandable: '\n' + lines.slice(maxLines).join('\n'),
  };
};

interface ExpandableCodeBlockProps {
  content: string;
  id: string;
  maxLines?: number;
}

/**
 * Code block with expandable section for long content, following PatternFly's expandable code block pattern.
 * Shows first N lines, with remaining content in a detached ExpandableSection.
 */
const ExpandableCodeBlock: FunctionComponent<ExpandableCodeBlockProps> = ({
  content,
  id,
  maxLines = CODE_BLOCK_MAX_LINES,
}) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const [isExpanded, setIsExpanded] = useState(false);
  const { visible, expandable } = splitContentAtLine(content, maxLines);
  const hasExpandableContent = expandable.length > 0;

  const toggleId = `code-block-toggle-${id}`;
  const contentId = `code-block-expand-${id}`;

  return (
    <CodeBlock className="tools-drawer-content__code-block pf-v6-u-mt-sm">
      <CodeBlockCode>
        {visible}
        {hasExpandableContent && (
          <ExpandableSection
            isExpanded={isExpanded}
            isDetached
            contentId={contentId}
            toggleId={toggleId}
          >
            {expandable}
          </ExpandableSection>
        )}
      </CodeBlockCode>
      {hasExpandableContent && (
        <ExpandableSectionToggle
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          contentId={contentId}
          toggleId={toggleId}
          direction="up"
        >
          {isExpanded ? t('chat.tools.showLess') : t('chat.tools.showMore')}
        </ExpandableSectionToggle>
      )}
    </CodeBlock>
  );
};

interface ToolStepContentProps {
  toolCall: ToolCallState;
  stepNumber: number;
  totalSteps: number;
}

/**
 * Content displayed within each progress step
 */
const ToolStepContent: FunctionComponent<ToolStepContentProps> = ({
  toolCall,
  stepNumber,
  totalSteps,
}) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const [isArgumentsExpanded, setIsArgumentsExpanded] = useState(false);
  const [isResultExpanded, setIsResultExpanded] = useState(false);

  const argumentsToggleId = `tool-arguments-toggle-${toolCall.id}`;
  const argumentsContentId = `tool-arguments-content-${toolCall.id}`;
  const resultToggleId = `tool-result-toggle-${toolCall.id}`;
  const resultContentId = `tool-result-content-${toolCall.id}`;

  const hasArguments = toolCall.arguments && Object.keys(toolCall.arguments).length > 0;
  const hasResult = toolCall.result !== undefined;
  const isError = toolCall.status === 'failure';

  const formattedArguments = hasArguments ? JSON.stringify(toolCall.arguments, null, 2) : '';
  const formattedResult = hasResult ? formatResult(toolCall.result) : '';

  return (
    <Stack hasGutter className="tools-drawer-content__step-body pf-v6-u-mt-xs">
      {/* Metadata: Step X of Y • tool_type */}
      <StackItem>
        <Content component={ContentVariants.small} className="pf-v6-u-text-color-subtle">
          Step {stepNumber} of {totalSteps} • {toolCall.name}
        </Content>
      </StackItem>

      {/* Arguments expandable section */}
      {hasArguments && (
        <StackItem>
          <ExpandableSection
            toggleText={t('chat.tools.arguments')}
            isExpanded={isArgumentsExpanded}
            onToggle={() => setIsArgumentsExpanded(!isArgumentsExpanded)}
            toggleId={argumentsToggleId}
            contentId={argumentsContentId}
          >
            <ExpandableCodeBlock content={formattedArguments} id={`${toolCall.id}-args`} />
          </ExpandableSection>
        </StackItem>
      )}

      {/* Result or Error details expandable section */}
      {hasResult && (
        <StackItem>
          <ExpandableSection
            toggleText={isError ? t('chat.tools.errorDetails') : t('chat.tools.result')}
            isExpanded={isResultExpanded}
            onToggle={() => setIsResultExpanded(!isResultExpanded)}
            toggleId={resultToggleId}
            contentId={resultContentId}
          >
            <ExpandableCodeBlock content={formattedResult} id={`${toolCall.id}-result`} />
          </ExpandableSection>
        </StackItem>
      )}

      {/* ID string */}
      <StackItem>
        <Content component={ContentVariants.small} className="pf-v6-u-text-color-subtle">
          ID: {toolCall.id}
        </Content>
      </StackItem>
    </Stack>
  );
};

/**
 * Drawer content displaying the list of all tool calls used to generate an AI response.
 */
export const ToolsDrawerContent: FunctionComponent<ToolsDrawerContentProps> = ({ toolCalls }) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const totalSteps = toolCalls.length;

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
      <StackItem className="drawer-item">
        <ProgressStepper isVertical aria-label={t('chat.tools.ariaLabel')}>
          {toolCalls.map((toolCall, index) => {
            const displayName = formatToolName(toolCall.name);
            const stepNumber = index + 1;
            const statusLabel =
              toolCall.status === 'success'
                ? t('chat.tools.statusSuccess')
                : toolCall.status === 'failure'
                ? t('chat.tools.statusFail')
                : t('chat.tools.running');

            return (
              <ProgressStep
                key={toolCall.id}
                variant={getStepVariant(toolCall.status)}
                icon={getStatusIcon(toolCall.status)}
                id={`tool-step-${toolCall.id}`}
                titleId={`tool-step-title-${toolCall.id}`}
                aria-label={`${displayName} - ${statusLabel}`}
              >
                <Flex
                  spaceItems={{ default: 'spaceItemsSm' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                  flexWrap={{ default: 'nowrap' }}
                >
                  <FlexItem>
                    <span className="pf-v6-u-font-weight-bold">{displayName}</span>
                  </FlexItem>
                  <FlexItem>
                    <Label isCompact color={getLabelColor(toolCall.status)}>
                      {statusLabel}
                    </Label>
                  </FlexItem>
                </Flex>
                <ToolStepContent
                  toolCall={toolCall}
                  stepNumber={stepNumber}
                  totalSteps={totalSteps}
                />
              </ProgressStep>
            );
          })}
        </ProgressStepper>
      </StackItem>
    </Stack>
  );
};
