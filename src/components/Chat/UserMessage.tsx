import type { FunctionComponent } from 'react';
import { Message } from '@patternfly/chatbot';
import { CopyIcon, EditIcon } from '@patternfly/react-icons';
import type { Message as MessageType } from '../../hooks/AIState';

export interface UserMessageProps {
  message: MessageType;
  isLastUserMessage: boolean;
  // TODO: Add these handlers when implementing edit functionality
  // onEdit?: (messageId: string, newContent: string) => void;
  // onCopy?: (content: string) => void;
}

export const UserMessage: FunctionComponent<UserMessageProps> = ({
  message,
  isLastUserMessage,
}) => {
  let content = message.answer || '';
  content = content
    .split('=====The following is the user query that was asked:')
    .pop();

  // TODO: Implement user message actions
  const handleEdit = (): void => {
    // ...regenerate the bot's last response
  };
  const handleCopy = (): void => {
    navigator.clipboard.writeText(content);
  };

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
