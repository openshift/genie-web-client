/* eslint-disable react/prop-types */
import { useMemo, FunctionComponent, memo, useCallback, useState } from 'react';
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
import { useSendFeedback } from '../../hooks/AIState';
import type { ToolCallState } from './useToolCalls';
import { ToolCallsList } from './ToolCallsList';
import { ArtifactRenderer } from '../artifacts';
import type { Artifact, GenieAdditionalProperties } from '../../types/chat';
import { toMessageQuickResponses } from '../new-chat/suggestions';

export interface AIMessageProps {
  message: MessageType<GenieAdditionalProperties>;
  conversationId: string;
  userQuestion: string;
  onQuickResponse: (text: string) => void;
  isStreaming?: boolean;
  toolCalls?: ToolCallState[];
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
  ({
    message,
    conversationId,
    userQuestion,
    onQuickResponse,
    isStreaming = false,
    toolCalls = [],
  }) => {
    const { t } = useTranslation('plugin__genie-web-client');
    const content = message.answer || '';
    const [feedbackRating, setFeedbackRating] = useState<'good' | 'bad' | null>(null);
    const { sendFeedback } = useSendFeedback();

    // extract quick responses from message additionalAttributes
    const additionalAttrs = message.additionalAttributes;
    const quickResponsesPayload = additionalAttrs?.quickResponses;

    const handleCopy = useCallback((): void => {
      navigator.clipboard.writeText(content);
    }, [content]);

    const handleRegenerate = useCallback((): void => {
      console.log('Regenerate');
    }, []);

    const handleFeedback = useCallback(
      async (isPositive: boolean): Promise<void> => {
        const newRating = isPositive ? 'good' : 'bad';

        // clicking same button again clears the selection
        if (
          (isPositive && feedbackRating === 'good') ||
          (!isPositive && feedbackRating === 'bad')
        ) {
          setFeedbackRating(null);
          return;
        }

        // update button state right away so user sees it
        setFeedbackRating(newRating);

        // send the feedback to backend
        await sendFeedback({
          conversation_id: conversationId,
          user_question: userQuestion,
          llm_response: content,
          isPositive: isPositive,
        });
      },
      [feedbackRating, conversationId, userQuestion, content, sendFeedback],
    );

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
        copy: {
          icon: <CopyIcon />,
          onClick: handleCopy,
          tooltipContent: t('Copy'),
          clickedTooltipContent: t('Copied'),
        },
        regenerate: {
          icon: <RedoIcon />,
          onClick: handleRegenerate,
          tooltipContent: t('Regenerate'),
        },
        positive: {
          icon: <ThumbsUpIcon />,
          onClick: () => handleFeedback(true),
          tooltipContent: t('Good response'),
          clickedTooltipContent: t('Response rated good'),
          ariaLabel: t('Good response'),
          clickedAriaLabel: t('Response rated good'),
          isClicked: feedbackRating === 'good',
        },
        negative: {
          icon: <ThumbsDownIcon />,
          onClick: () => handleFeedback(false),
          tooltipContent: t('Bad response'),
          clickedTooltipContent: t('Response rated bad'),
          ariaLabel: t('Bad response'),
          clickedAriaLabel: t('Response rated bad'),
          isClicked: feedbackRating === 'bad',
        },
        share: {
          icon: <ShareIcon />,
          onClick: handleShare,
          tooltipContent: t('Share'),
        },
        listen: {
          icon: <VolumeUpIcon />,
          onClick: handleReadAloud,
          tooltipContent: t('Read aloud'),
        },
        report: {
          icon: <FlagIcon />,
          onClick: handleReport,
          tooltipContent: t('Report'),
        },
      }),
      [
        handleCopy,
        handleRegenerate,
        handleFeedback,
        handleShare,
        handleReadAloud,
        handleReport,
        feedbackRating,
        t,
      ],
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

    return (
      <Message
        name="Genie"
        isLoading={isStreaming}
        role="bot"
        content={content}
        extraContent={extraContent}
        actions={actions}
        quickResponses={quickResponses}
        persistActionSelection={true}
      />
    );
  },
  (prevProps, nextProps) => {
    // re-render if message id changes (shouldn't happen with proper keys, but just in case)
    if (prevProps.message.id !== nextProps.message.id) {
      return false;
    }
    // re-render if any of these change
    return (
      prevProps.isStreaming === nextProps.isStreaming &&
      prevProps.message.answer === nextProps.message.answer &&
      prevProps.toolCalls === nextProps.toolCalls && // shallow check is fine here
      prevProps.conversationId === nextProps.conversationId &&
      prevProps.userQuestion === nextProps.userQuestion
    );
  },
);

AIMessage.displayName = 'AIMessage';
