/* eslint-disable react/prop-types */
import { FunctionComponent, memo, useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Message } from '@patternfly/chatbot';
import { TextArea, Button, Flex, FlexItem } from '@patternfly/react-core';
import { CopyIcon, EditIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import type { Message as MessageType } from '../../hooks/AIState';
import { useInProgress } from '../../hooks/AIState';

export interface UserMessageProps {
  message: MessageType;
  isLastUserMessage: boolean;
  onEditMessage?: (editedContent: string) => void;
}

export const UserMessage: FunctionComponent<UserMessageProps> = memo(
  ({ message, isLastUserMessage, onEditMessage }) => {
    const { t } = useTranslation('plugin__genie-web-client');
    const isInProgress = useInProgress();
    const isEditDisabled = isLastUserMessage && isInProgress;
    const content = message.answer || '';
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);

    const timestamp = useMemo(() => {
      const date = new Date(message.date as Date);
      return isNaN(date.getTime())
        ? ''
        : `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }, [message.date]);

    const handleEdit = useCallback((): void => {
      if (isEditDisabled) return;
      setEditContent(content);
      setIsEditing(true);
    }, [content, isEditDisabled]);

    const handleCancel = useCallback((): void => {
      setEditContent(content);
      setIsEditing(false);
    }, [content]);

    const handleUpdate = useCallback((): void => {
      if (isEditDisabled) return;
      if (editContent.trim() && editContent !== content && onEditMessage) {
        onEditMessage(editContent);
        setIsEditing(false);
      }
    }, [editContent, content, isEditDisabled, onEditMessage]);

    const handleEditChange = useCallback(
      (_event: FormEvent<HTMLTextAreaElement>, value: string) => {
        setEditContent(value);
      },
      [],
    );

    const handleCopy = useCallback((): void => {
      navigator.clipboard.writeText(content);
    }, [content]);

    const copyAction = useMemo(
      () => ({
        icon: <CopyIcon />,
        onClick: handleCopy,
        tooltipContent: t('message.action.copy'),
        clickedTooltipContent: t('message.action.copied'),
      }),
      [handleCopy, t],
    );

    const editAction = useMemo(
      () => ({
        icon: <EditIcon />,
        onClick: isEditDisabled ? undefined : handleEdit,
        isDisabled: isEditDisabled,
        tooltipContent: t('message.action.edit'),
      }),
      [handleEdit, isEditDisabled, t],
    );

    const actions = useMemo(
      () =>
        isLastUserMessage
          ? { copy: copyAction, edit: editAction }
          : ({ copy: copyAction } as Record<string, typeof copyAction>),
      [isLastUserMessage, copyAction, editAction],
    );

    if (isEditing) {
      return (
        <Flex
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          <FlexItem>
            <TextArea
              value={editContent}
              onChange={handleEditChange}
              aria-label={t('message.action.editAriaLabel')}
              autoResize
              rows={3}
            />
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <Button variant="secondary" onClick={handleCancel}>
                  {t('message.action.cancel')}
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="primary"
                  onClick={handleUpdate}
                  isDisabled={isEditDisabled || !editContent.trim() || editContent === content}
                >
                  {t('message.action.update')}
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      );
    }

    return (
      <Message
        className="genie-user-message"
        name="You"
        role="user"
        content={content}
        timestamp={timestamp}
        actions={actions}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.isLastUserMessage === nextProps.isLastUserMessage &&
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.answer === nextProps.message.answer &&
    prevProps.message.date === nextProps.message.date,
);

UserMessage.displayName = 'UserMessage';
