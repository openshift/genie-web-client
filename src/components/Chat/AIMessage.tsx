import { useMemo, FunctionComponent, memo, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next';
import type { Message as MessageType } from '../../hooks/AIState';
import type { ToolCallState } from './useToolCalls';
import { ToolCallsList } from './ToolCallsList';
import { ArtifactRenderer } from '../artifacts';
import type { Artifact } from '../../types/chat';
import { toMessageQuickResponses } from '../new-chat/suggestions';
import type { GenieAdditionalProperties } from '../new-chat/suggestions';

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

export const AIMessage: FunctionComponent<AIMessageProps> = memo(
  ({ message, onQuickResponse, isStreaming = false, toolCalls = [] }) => {
    const { t } = useTranslation('plugin__genie-web-client');
    const content = message.answer || '';

    // Extract quick responses from message additionalAttributes
    const additionalAttrs = message.additionalAttributes as GenieAdditionalProperties | undefined;
    const quickResponsesPayload = additionalAttrs?.quickResponses;

    const handleCopy = useCallback((): void => {
      navigator.clipboard.writeText(content);
    }, [content]);

    const handleRegenerate = useCallback((): void => {
      console.log('Regenerate');
    }, []);

    const handleFeedback = useCallback((isPositive: boolean): void => {
      console.log('Feedback', isPositive);
    }, []);

    const handleShare = useCallback((): void => {
      console.log('Share');
    }, []);

    const handleReadAloud = useCallback((): void => {
      console.log('Read aloud');
    }, []);

    const handleReport = useCallback((): void => {
      console.log('Report');
    }, []);

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
      [handleCopy, handleRegenerate, handleFeedback, handleShare, handleReadAloud, handleReport],
    );

    const artifacts = useMemo(
      () => collectArtifactsFromToolCalls(toolCalls),
      [toolCalls],
    );

    // Convert quick responses payload to PatternFly Message format
    const quickResponses = useMemo(
      () => toMessageQuickResponses(quickResponsesPayload?.items, t, onQuickResponse),
      [quickResponsesPayload?.items, t, onQuickResponse],
    );

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
        quickResponses={quickResponses}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isStreaming === nextProps.isStreaming &&
      prevProps.message.answer === nextProps.message.answer &&
      prevProps.toolCalls === nextProps.toolCalls // Shallow reference check is sufficient
    );
  },
);

AIMessage.displayName = 'AIMessage';
