import React from 'react';
import { Message } from '@patternfly/chatbot';
// import { useTranslation } from 'react-i18next';
// import { toMessageQuickResponses } from '../new-chat/suggestions';
import { CopyIcon, RedoIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, VolumeUpIcon, FlagIcon } from '@patternfly/react-icons';
import { type Message as MessageType } from '@redhat-cloud-services/ai-client-state';

// =============================================================================
// AI MESSAGE COMPONENT
// =============================================================================
// AI messages can stream content and have action buttons:
// - Copy, Regenerate, Thumbs up/down, Share, Read aloud, etc.
// - Re-renders frequently during streaming (content updates with each chunk)
// - Should be memoized but with looser comparison to allow streaming updates
// =============================================================================

export interface AIMessageProps {
  message: MessageType;
  extraContent: React.ReactNode[] | undefined;
  onQuickResponse: (text: string) => void;
  isStreaming?: boolean;
  // TODO: Add these handlers when implementing AI message actions
  // onRegenerate?: (messageId: string) => void;
  // onCopy?: (content: string) => void;
  // onFeedback?: (messageId: string, isPositive: boolean) => void;
  // onShare?: (messageId: string) => void;
  // onReadAloud?: (content: string) => void;
}

const arePropsEqual = (prevProps: AIMessageProps, nextProps: AIMessageProps) => {
  // AI messages update during streaming - compare content to detect changes
  const prevContent = prevProps.message.answer || '';
  const nextContent = nextProps.message.answer || '';

  return (
    prevProps.message.id === nextProps.message.id &&
    prevContent === nextContent &&
    prevProps.extraContent === nextProps.extraContent &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.message.additionalAttributes?.quickResponses ===
      nextProps.message.additionalAttributes?.quickResponses
  );
};

const AIMessageComponent: React.FunctionComponent<AIMessageProps> = ({
  message,
  extraContent,
  onQuickResponse,
  isStreaming = false,
}) => {
//   const { t } = useTranslation('plugin__genie-web-client');

  const content = message.answer || '';

//   const quickResponses = toMessageQuickResponses(
//     message.additionalAttributes?.quickResponses?.items,
//     t,
//     onQuickResponse,
//   );

  // TODO: Will eventually come from useChat hook 
  const messageIsLoading = !content;

  const handleCopy = () => { navigator.clipboard.writeText(content); };
  const handleRegenerate = () => { console.log('Regenerate'); };
  const handleFeedback = (isPositive: boolean) => { console.log('Feedback', isPositive); };
  const handleShare = () => { console.log('Share'); };
  const handleReadAloud = () => { console.log('Read aloud'); };
  const handleReport = () => { console.log('Report'); };

  // Memoize actions to prevent unnecessary re-renders
  const actions = React.useMemo(() => ({
    copy: { icon: <CopyIcon />, onClick: handleCopy, label: 'Copy' },
    regenerate: { icon: <RedoIcon />, onClick: handleRegenerate, label: 'Regenerate' },
    positive: { icon: <ThumbsUpIcon />, onClick: () => handleFeedback(true), label: 'Good response' },
    negative: { icon: <ThumbsDownIcon />, onClick: () => handleFeedback(false), label: 'Bad response' },
    share: { icon: <ShareIcon />, onClick: handleShare, label: 'Share' },
    listen: { icon: <VolumeUpIcon />, onClick: handleReadAloud, label: 'Read aloud' },
    report: { icon: <FlagIcon />, onClick: handleReport, label: 'Report' },
  }), [content]);

  // Memoize deep thinking config
  const deepThinking = React.useMemo(() => ({
    toggleContent: isStreaming ? 'Thinking' : 'Thought process',
    body: <p>Reasoning coming soon...</p>,
    expandableSectionProps: {
      isExpanded: isStreaming,
    },
  }), [isStreaming]);

  return (
    <Message
      isLoading={messageIsLoading}
      deepThinking={deepThinking}
      role="bot"
      content={content}
      // quickResponses={quickResponses}
      extraContent={
        extraContent ? { afterMainContent: extraContent } : undefined
      }
      // TODO: PF will need to support more actions; tooltip not working on unknown keys
      actions={actions}
    />
  );
};

export const AIMessage = React.memo(AIMessageComponent, arePropsEqual);
