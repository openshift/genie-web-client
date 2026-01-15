import { FunctionComponent, memo, useCallback, useMemo } from 'react';
import { Message } from '@patternfly/chatbot';
import { CopyIcon, EditIcon } from '@patternfly/react-icons';
import type { Message as MessageType } from '../../hooks/AIState';

export interface UserMessageProps {
  message: MessageType;
  isLastUserMessage: boolean;
  // onEdit?: (messageId: string, newContent: string) => void;
  // onCopy?: (content: string) => void;
}

export const UserMessage: FunctionComponent<UserMessageProps> = memo(
  ({ message, isLastUserMessage }) => {
    const content = message.answer || '';
    
    const handleEdit = useCallback((): void => {
      // ...regenerate the bot's last response
    }, []);

    const handleCopy = useCallback((): void => {
      navigator.clipboard.writeText(content);
    }, [content]);

    const copyAction = useMemo(
      () => ({ icon: <CopyIcon />, onClick: handleCopy, label: 'Copy' }),
      [handleCopy],
    );

    const editAction = useMemo(
      () => ({ icon: <EditIcon />, onClick: handleEdit, label: 'Edit' }),
      [handleEdit],
    );

    const actions = useMemo(
      () => (isLastUserMessage ? { copy: copyAction, edit: editAction } : { copy: copyAction }),
      [isLastUserMessage, copyAction, editAction],
    );

    return <Message name='You' role="user" content={content} actions={actions} />;
  },
  (prevProps, nextProps) =>
    prevProps.isLastUserMessage === nextProps.isLastUserMessage &&
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.answer === nextProps.message.answer,
);

UserMessage.displayName = 'UserMessage';
