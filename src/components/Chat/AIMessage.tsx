import React from 'react';
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
import { type Message as MessageType } from '@redhat-cloud-services/ai-client-state';
import { type ToolCallState } from './useToolCalls';
import { ToolCallsList } from './ToolCallsList';

export interface AIMessageProps {
  message: MessageType;
  extraContent: React.ReactNode[] | undefined;
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

const arePropsEqual = (prevProps: AIMessageProps, nextProps: AIMessageProps) => {
  // AI messages update during streaming - compare content to detect changes
  const prevContent = prevProps.message.answer || '';
  const nextContent = nextProps.message.answer || '';

  // Compare tool calls by length and status (shallow comparison)
  const prevToolCalls = prevProps.toolCalls || [];
  const nextToolCalls = nextProps.toolCalls || [];

  const toolCallsEqual =
    prevToolCalls.length === nextToolCalls.length &&
    prevToolCalls.every(
      (call, i) =>
        call.id === nextToolCalls[i]?.id &&
        call.status === nextToolCalls[i]?.status,
    );

  return (
    prevProps.message.id === nextProps.message.id &&
    prevContent === nextContent &&
    prevProps.extraContent === nextProps.extraContent &&
    prevProps.isStreaming === nextProps.isStreaming &&
    toolCallsEqual &&
    prevProps.message.additionalAttributes?.quickResponses ===
      nextProps.message.additionalAttributes?.quickResponses
  );
};

const AIMessageComponent: React.FunctionComponent<AIMessageProps> = ({
  message,
  extraContent,
  onQuickResponse,
  isStreaming = false,
  toolCalls = [],
}) => {
  const content = message.answer || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };
  const handleRegenerate = () => {
    console.log('Regenerate');
  };
  const handleFeedback = (isPositive: boolean) => {
    console.log('Feedback', isPositive);
  };
  const handleShare = () => {
    console.log('Share');
  };
  const handleReadAloud = () => {
    console.log('Read aloud');
  };
  const handleReport = () => {
    console.log('Report');
  };

  // Memoize actions to prevent unnecessary re-renders
  const actions = React.useMemo(
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

  // Combine tool calls with extra content
  const hasToolCalls = toolCalls.length > 0;
  const combinedExtraContent = {
    beforeMainContent: hasToolCalls ? <ToolCallsList toolCalls={toolCalls} /> : null,
    afterMainContent: extraContent,
  };

  return (
    <Message
      isLoading={isStreaming}
      role="bot"
      content={content}
      extraContent={combinedExtraContent}
      actions={actions}
    />
  );
};

export const AIMessage = React.memo(AIMessageComponent, arePropsEqual);
