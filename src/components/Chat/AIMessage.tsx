import { useMemo } from 'react';
import type { FunctionComponent } from 'react';
import { Message } from '@patternfly/chatbot';
import {
  CopyIcon,
  RedoIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ShareIcon,
  VolumeUpIcon,
  FlagIcon,
} from '@patternfly/react-icons';
import type { Message as MessageType } from '../../hooks/AIState';
import type { ToolCallState } from './useToolCalls';
import { ToolCallsList } from './ToolCallsList';
import { ArtifactRenderer } from '../artifacts';
import type { Artifact } from '../../types/chat';

export interface AIMessageProps {
  message: MessageType;
  onQuickResponse: (text: string) => void;
  isStreaming?: boolean;
  toolCalls?: ToolCallState[];
  // TODO: Add these handlers when implementing AI message actions
  // onRegenerate?: (messageId: string) => void;
  // onCopy?: (content: string) => void;
  // onFeedback?: (messageId: string, isPositive: boolean) => void;
  // onShare?: (messageId: string) => void;
  // onReadAloud?: (content: string) => void;
}

/**
 * Collect all artifacts from completed tool calls
 */
function collectArtifactsFromToolCalls(toolCalls: ToolCallState[]): Artifact[] {
  return toolCalls
    .filter((call) => call.status === 'completed' && call.artifacts)
    .flatMap((call) => call.artifacts || []);
}

export const AIMessage: FunctionComponent<AIMessageProps> = ({
  message,
  onQuickResponse,
  isStreaming = false,
  toolCalls = [],
}) => {
  const content = message.answer || '';

  const handleCopy = (): void => {
    navigator.clipboard.writeText(content);
  };
  const handleRegenerate = (): void => {
    console.log('Regenerate');
  };
  const handleFeedback = (isPositive: boolean): void => {
    console.log('Feedback', isPositive);
  };
  const handleShare = (): void => {
    console.log('Share');
  };
  const handleReadAloud = (): void => {
    console.log('Read aloud');
  };
  const handleReport = (): void => {
    console.log('Report');
  };

  // Memoize actions to prevent unnecessary re-renders
  const actions = useMemo(
    () => ({
      copy: { icon: <CopyIcon />, onClick: handleCopy, label: 'Copy' },
      regenerate: {
        icon: <RedoIcon />,
        onClick: handleRegenerate,
        label: 'Regenerate',
      },
      positive: {
        icon: <ThumbsUpIcon />,
        onClick: () => handleFeedback(true),
        label: 'Good response',
      },
      negative: {
        icon: <ThumbsDownIcon />,
        onClick: () => handleFeedback(false),
        label: 'Bad response',
      },
      share: { icon: <ShareIcon />, onClick: handleShare, label: 'Share' },
      listen: {
        icon: <VolumeUpIcon />,
        onClick: handleReadAloud,
        label: 'Read aloud',
      },
      report: { icon: <FlagIcon />, onClick: handleReport, label: 'Report' },
    }),
    [content],
  );

  // Collect all artifacts from completed tool calls
  const artifacts = useMemo(
    () => collectArtifactsFromToolCalls(toolCalls),
    [toolCalls],
  );

  // Build extra content with tool calls and artifacts
  const hasToolCalls = toolCalls.length > 0;
  const hasArtifacts = artifacts.length > 0;
  const extraContent = {
    beforeMainContent: hasToolCalls ? <ToolCallsList toolCalls={toolCalls} /> : null,
    afterMainContent: hasArtifacts ? <ArtifactRenderer artifacts={artifacts} /> : null,
  };

  return (
    <Message
      isLoading={isStreaming}
      role="bot"
      content={content}
      extraContent={extraContent}
      actions={actions}
    />
  );
};
