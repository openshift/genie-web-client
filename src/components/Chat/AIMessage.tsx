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
import { useBadResponseModal } from './feedback/BadResponseModal';
import { useToastAlerts } from '../toast-alerts/ToastAlertProvider';

// feedback rating constants to prevent typos
const FEEDBACK_RATING = {
  GOOD: 'good',
  BAD: 'bad',
} as const;

type FeedbackRating = (typeof FEEDBACK_RATING)[keyof typeof FEEDBACK_RATING] | null;

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
    const [feedbackRating, setFeedbackRating] = useState<FeedbackRating>(null);
    const { sendFeedback, isLoading } = useSendFeedback();
    const { badResponseModalToggle } = useBadResponseModal();
    const { addAlert } = useToastAlerts();

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
        const newRating = isPositive ? FEEDBACK_RATING.GOOD : FEEDBACK_RATING.BAD;

        // clicking same button again clears the selection
        if (
          (isPositive && feedbackRating === FEEDBACK_RATING.GOOD) ||
          (!isPositive && feedbackRating === FEEDBACK_RATING.BAD)
        ) {
          setFeedbackRating(null);
          return;
        }

        // thumbs down opens the feedback form
        if (!isPositive) {
          // set state to show thumbs down is selected
          setFeedbackRating(newRating);
          badResponseModalToggle(message);
          return;
        }

        // thumbs up sends feedback directly
        // update button state optimistically so user sees immediate feedback
        setFeedbackRating(newRating);

        try {
          await sendFeedback({
            conversation_id: conversationId,
            user_question: userQuestion,
            llm_response: content,
            isPositive: true,
          });

          // show success toast
          addAlert({
            id: `feedback-success-${message.id}-${Date.now()}`,
            variant: 'success',
            title: t('feedback.success.title'),
          });
        } catch (err) {
          // reset state on error so user can retry
          setFeedbackRating(null);

          // show error toast
          addAlert({
            id: `feedback-error-${message.id}-${Date.now()}`,
            variant: 'danger',
            title: t('feedback.error.title'),
            children: typeof err === 'string' ? err : t('feedback.badResponse.error.unexpected'),
          });
        }
      },
      [
        feedbackRating,
        conversationId,
        userQuestion,
        content,
        sendFeedback,
        badResponseModalToggle,
        message,
        addAlert,
        t,
      ],
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
          tooltipContent: t('message.action.copy'),
          clickedTooltipContent: t('message.action.copied'),
        },
        regenerate: {
          icon: <RedoIcon />,
          onClick: handleRegenerate,
          tooltipContent: t('message.action.regenerate'),
        },
        positive: {
          icon: <ThumbsUpIcon />,
          onClick: () => handleFeedback(true),
          tooltipContent: t('message.action.goodResponse'),
          clickedTooltipContent: t('message.action.goodResponseRated'),
          ariaLabel: t('message.action.goodResponse'),
          clickedAriaLabel: t('message.action.goodResponseRated'),
          isClicked: feedbackRating === FEEDBACK_RATING.GOOD,
          isDisabled: isLoading,
        },
        negative: {
          icon: <ThumbsDownIcon />,
          onClick: () => handleFeedback(false),
          tooltipContent: t('message.action.badResponse'),
          clickedTooltipContent: t('message.action.badResponseRated'),
          ariaLabel: t('message.action.badResponse'),
          clickedAriaLabel: t('message.action.badResponseRated'),
          isClicked: feedbackRating === FEEDBACK_RATING.BAD,
        },
        share: {
          icon: <ShareIcon />,
          onClick: handleShare,
          tooltipContent: t('message.action.share'),
        },
        listen: {
          icon: <VolumeUpIcon />,
          onClick: handleReadAloud,
          tooltipContent: t('message.action.readAloud'),
        },
        report: {
          icon: <FlagIcon />,
          onClick: handleReport,
          tooltipContent: t('message.action.report'),
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
        isLoading,
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
