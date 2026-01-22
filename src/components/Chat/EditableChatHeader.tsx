import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChatbotHeader,
  ChatbotHeaderMain,
  ChatbotHeaderActions,
  ChatbotHeaderOptionsDropdown,
} from '@patternfly/chatbot';
import {
  ActionList,
  ActionListItem,
  Alert,
  AlertVariant,
  Button,
  DropdownItem,
  DropdownList,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  Tooltip,
} from '@patternfly/react-core';
import { RhStandardThoughtBubbleIcon, CheckIcon, TimesIcon } from '@patternfly/react-icons';
import { useActiveConversation, useUpdateConversationTitle } from '../../hooks/AIState';
import { useSplitScreenDrawer } from '../drawer/SplitScreenDrawerContext';

export const EditableChatHeader: React.FC = () => {
  const { t } = useTranslation('plugin__genie-web-client');
  const activeConversation = useActiveConversation();
  const conversationId = activeConversation?.id;
  const { updateTitle, isUpdating, error: apiError, clearError } = useUpdateConversationTitle();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [localError, setLocalError] = useState<string | null>(null);
  const originalTitleRef = useRef<string>(title);

  // sync title with active conversation
  useEffect(() => {
    if (isEditing) {
      return;
    }
    if (activeConversation?.title) {
      setTitle(activeConversation.title);
    } else {
      // fallback when title is missing
      setTitle(t('chat.defaultTitle'));
    }
  }, [activeConversation?.title, isEditing, t]);

  const { openSplitScreenDrawer } = useSplitScreenDrawer();
  const onEditClick = () => {
    originalTitleRef.current = title;
    setIsEditing(true);
    clearError();
    setLocalError(null);
  };

  const handleInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setTitle(value);
    if (validationError && value.trim()) {
      setValidationError(undefined);
    }
    if (apiError) {
      clearError();
    }
    if (localError) {
      setLocalError(null);
    }
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError(t('chat.header.error.emptyTitle'));
      return;
    }

    if (!conversationId) {
      setLocalError(t('chat.header.error.missingConversationId'));
      return;
    }

    try {
      await updateTitle(conversationId, trimmedTitle);
      setIsEditing(false);
      setValidationError(undefined);
      setLocalError(null);
    } catch (error) {
      // error already tracked by hook, stay in edit mode
      console.error('Failed to update title:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(originalTitleRef.current);
    setValidationError(undefined);
    clearError();
    setLocalError(null);
  };

  return (
    <>
      {(apiError || localError) && (
        <Alert
          variant={AlertVariant.danger}
          title={t('chat.header.error.updateFailed')}
          isInline
          className="pf-v6-u-mb-md"
        >
          {localError || apiError}
        </Alert>
      )}
      <ChatbotHeader>
        <ChatbotHeaderMain>
          <span className="chat-header-icon">
            <RhStandardThoughtBubbleIcon />
          </span>
          {isEditing ? (
            <Tooltip
              trigger="manual"
              isVisible={!!validationError}
              position="top"
              content={validationError}
            >
              <>
                <TextInputGroup>
                  <TextInputGroupMain
                    value={title}
                    onChange={handleInputChange}
                    aria-label="Edit conversation title"
                    aria-invalid={!!validationError}
                    disabled={isUpdating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSave();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCancel();
                      }
                    }}
                  />
                </TextInputGroup>
                <ActionList isIconList>
                  <ActionListItem>
                    <Button
                      variant="plain"
                      aria-label="Cancel title edit"
                      icon={<TimesIcon />}
                      onClick={handleCancel}
                      isDisabled={isUpdating}
                    />
                  </ActionListItem>
                  <ActionListItem>
                    <Button
                      variant="plain"
                      aria-label="Save title"
                      icon={isUpdating ? <Spinner size="md" /> : <CheckIcon />}
                      onClick={handleSave}
                      isDisabled={isUpdating}
                    />
                  </ActionListItem>
                </ActionList>
              </>
            </Tooltip>
          ) : (
            <Button
              variant="plain"
              isInline
              onClick={onEditClick}
              aria-label="Edit conversation title"
            >
              {title}
            </Button>
          )}
        </ChatbotHeaderMain>
        <ChatbotHeaderActions>
          {!isEditing && (
            <>
              <Button
                variant="primary"
                onClick={() => openSplitScreenDrawer({ children: <div>Split screen body</div> })}
              >
                Open split screen
              </Button>
              <ChatbotHeaderOptionsDropdown
                isCompact
                tooltipProps={{ content: t('chat.header.moreActions') }}
                toggleProps={{ 'aria-label': 'kebab dropdown toggle', isDisabled: false }}
              >
                <DropdownList>
                  <DropdownItem value="rename" onClick={onEditClick}>
                    {t('chat.rename')}
                  </DropdownItem>
                </DropdownList>
              </ChatbotHeaderOptionsDropdown>
            </>
          )}
        </ChatbotHeaderActions>
      </ChatbotHeader>
    </>
  );
};

export default EditableChatHeader;
