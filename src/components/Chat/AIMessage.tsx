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
import type { ToolCallState } from '../../hooks/useChatMessages';
import { ToolCallsList } from './ToolCallsList';
import { ArtifactRenderer } from '../artifacts';
import type { Artifact, GenieAdditionalProperties } from '../../types/chat';
import { toMessageQuickResponses } from '../new-chat/suggestions';

export interface AIMessageProps {
  message: MessageType<GenieAdditionalProperties>;
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
    const additionalAttrs = message.additionalAttributes;
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

    const artifacts = useMemo(() => collectArtifactsFromToolCalls(toolCalls), [toolCalls]);

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


    const timestamp = useMemo(() => {
      const date = message.date;
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }, [message.date]);

    const hasContent = content.length > 0;
    const showLoading = isStreaming && !hasContent;

    return (
      <Message
        name='Genie'
        isLoading={showLoading}
        role="bot"
        content={content}
        timestamp={timestamp}
        extraContent={extraContent}
        actions={actions}
        quickResponses={quickResponses}
      />
    );
  },
  (prevProps, nextProps) => {
    // Always re-render if message ID changes (shouldn't happen with proper keys, but safety check)
    if (prevProps.message.id !== nextProps.message.id) {
      return false;
    }
    // Re-render if any of these change
    return (
      prevProps.isStreaming === nextProps.isStreaming &&
      prevProps.message.answer === nextProps.message.answer &&
      prevProps.message.date === nextProps.message.date &&
      prevProps.toolCalls === nextProps.toolCalls // Shallow reference check is sufficient
    );
  },
);

AIMessage.displayName = 'AIMessage';
