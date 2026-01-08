import React from 'react';
import { Message } from '@patternfly/chatbot';
import { CopyIcon, EditIcon } from '@patternfly/react-icons';

// =============================================================================
// USER MESSAGE COMPONENT
// =============================================================================
// User messages are static once sent, with conditional actions:
// - If it's the LAST user message: shows Edit + Copy action buttons
//   - Editing triggers regeneration of the following bot response
// - If it's NOT the last user message: shows Copy action only (read-only)
// =============================================================================

export interface UserMessageProps {
  message: any;
  isLastUserMessage: boolean;
  // TODO: Add these handlers when implementing edit functionality
  // onEdit?: (messageId: string, newContent: string) => void;
  // onCopy?: (content: string) => void;
}

const arePropsEqual = (prevProps: UserMessageProps, nextProps: UserMessageProps) => {
  // User messages rarely change - only re-render if content or position changes
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.isLastUserMessage === nextProps.isLastUserMessage &&
    prevProps.message.answer === nextProps.message.answer
  );
};

const UserMessageComponent: React.FunctionComponent<UserMessageProps> = ({
  message,
  isLastUserMessage,
}) => {
  let content = message.answer || '';
  content = content
    .split('=====The following is the user query that was asked:')
    .pop();

  // TODO: Implement user message actions
  const handleEdit = () => { 
    // ...regenerate the bot's last response
  };
  const handleCopy = () => { navigator.clipboard.writeText(content); };

  const copyAction = { icon: <CopyIcon />, onClick: handleCopy, label: 'Copy' };
  const editAction = { icon: <EditIcon />, onClick: handleEdit, label: 'Edit' };

  return (
    <Message
      role="user"
      content={content}
      actions={isLastUserMessage ? { copy: copyAction, edit: editAction } : { copy: copyAction }}
    />
  );
};

export const UserMessage = React.memo(UserMessageComponent, arePropsEqual);
