/* eslint-disable react/prop-types */
import { useMemo, FunctionComponent, memo, useCallback, useState } from 'react';
import { Message } from '@patternfly/chatbot';
import { Flex, FlexItem } from '@patternfly/react-core';
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
import { getToolCallsFromMessage } from '../../hooks/useChatMessages';
import type { ToolCallState } from 'src/utils/toolCallHelpers';
import { ArtifactRenderer } from '../artifacts';
import type { Artifact, GenieAdditionalProperties } from '../../types/chat';
import { toMessageQuickResponses } from '../new-chat/suggestions';
import { ToolCalls } from './ToolCalls';
import { Sources } from './Sources';
import { ReferencedDocument } from 'src/hooks/AIState';
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
}

/**
 * Collect all artifacts from completed tool calls
 */
function collectArtifactsFromToolCalls(toolCalls: ToolCallState[]): Artifact[] {
  return toolCalls
    .filter((call) => call.status === 'success' && call.artifacts)
    .flatMap((call) => call.artifacts || []);
}

export const AIMessage: FunctionComponent<AIMessageProps> = memo(
  ({ message, conversationId, userQuestion, onQuickResponse, isStreaming = false }) => {
    const { t } = useTranslation('plugin__genie-web-client');
    const content = message.answer || '';
    const [feedbackRating, setFeedbackRating] = useState<FeedbackRating>(null);
    const { sendFeedback, isLoading } = useSendFeedback();
    const { badResponseModalToggle } = useBadResponseModal();
    const { addAlert } = useToastAlerts();

    // extract quick responses, referenced documents, and tool calls from message additionalAttributes
    const additionalAttrs = message.additionalAttributes;
    const quickResponsesPayload = additionalAttrs?.quickResponses;
    const referencedDocuments = (additionalAttrs?.referencedDocuments ??
      []) as ReferencedDocument[];
    const toolCalls = getToolCallsFromMessage(message);

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
          ariaLabel: 'Regenerate',
          onClick: handleRegenerate,
          tooltipContent: t('message.action.regenerate'),
          clickedAriaLabel: 'Regenerated',
          clickedTooltipContent: 'Regenerated',
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
          ariaLabel: 'Report',
          onClick: handleReport,
          tooltipContent: t('message.action.report'),
          clickedAriaLabel: 'Reported',
          clickedTooltipContent: 'Reported',
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
    const hasSources = referencedDocuments.length > 0;
    const hasEndContent = hasToolCalls || hasSources;
    const extraContent = {
      afterMainContent: hasArtifacts ? <ArtifactRenderer artifacts={artifacts} /> : null,
      endContent: hasEndContent ? (
        <Flex gap={{ default: 'gapSm' }}>
          {hasSources ? (
            <FlexItem>
              <Sources sources={referencedDocuments} />
            </FlexItem>
          ) : null}
          {hasToolCalls ? (
            <FlexItem>
              <ToolCalls toolCalls={toolCalls} />
            </FlexItem>
          ) : null}
        </Flex>
      ) : null,
    };

    const timestamp = useMemo(() => {
      const date = new Date(message.date as Date);
      return isNaN(date.getTime())
        ? ''
        : `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }, [message.date]);

    const hasContent = content.length > 0;
    const showLoading = isStreaming && !hasContent;

    return (
      <Message
        name="Genie"
        isLoading={showLoading}
        role="bot"
        content={content}
        timestamp={timestamp}
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
      prevProps.message.date === nextProps.message.date &&
      prevProps.conversationId === nextProps.conversationId &&
      prevProps.userQuestion === nextProps.userQuestion
    );
  },
);

AIMessage.displayName = 'AIMessage';
