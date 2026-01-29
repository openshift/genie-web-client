/* eslint-disable react/prop-types */
import { useMemo, FunctionComponent, memo, useCallback, useState, useEffect } from 'react';
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
    const [feedbackAnnouncement, setFeedbackAnnouncement] = useState<string | null>(null);
    const { sendFeedback, isLoading } = useSendFeedback();
    const { badResponseModalToggle } = useBadResponseModal();

    // clear screen reader announcement after a delay so it can announce again on next click
    useEffect(() => {
      if (!feedbackAnnouncement) return;
      const id = setTimeout(() => setFeedbackAnnouncement(null), 1500);
      return () => clearTimeout(id);
    }, [feedbackAnnouncement]);

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
          // no toast - button state is the sole confirmation; announce for screen readers
          setFeedbackAnnouncement(t('message.action.goodResponseRated'));
        } catch (err) {
          // reset state on error so user can retry
          setFeedbackRating(null);
          // no error toast - silently fail and allow retry
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

    // visually hidden live region so screen readers hear "response rated good" after thumbs up
    const screenReaderOnlyStyle: React.CSSProperties = {
      position: 'absolute',
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    };

    return (
      <>
        <div
          aria-live="polite"
          role="status"
          style={screenReaderOnlyStyle}
          data-testid="feedback-announcement"
        >
          {feedbackAnnouncement}
        </div>
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
          isLiveRegion={showLoading}
        />
      </>
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
