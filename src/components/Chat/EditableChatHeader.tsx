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
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  Tooltip,
} from '@patternfly/react-core';
import {
  RhStandardThoughtBubbleIcon,
  CheckIcon,
  TimesIcon,
  EllipsisHIcon,
} from '@patternfly/react-icons';
import {
  useActiveConversation,
  useUpdateConversationTitle,
  type ConversationForDelete,
} from '../../hooks/AIState';
import './EditableChatHeader.css';

export interface EditableChatHeaderProps {
  variant?: 'default' | 'inline';
  title?: string;
  conversationId?: string;
  onDeleteClick?: (conversation: ConversationForDelete) => void;
}

const editFormInputAndButtons = (
  title: string,
  validationError: string | undefined,
  isUpdating: boolean,
  onInputChange: (event: React.FormEvent<HTMLInputElement>, value: string) => void,
  onSave: () => void,
  onCancel: () => void,
  t: (key: string) => string,
) => (
  <>
    <TextInputGroup>
      <TextInputGroupMain
        value={title}
        onChange={onInputChange}
        aria-label={t('chat.header.editTitle')}
        aria-invalid={!!validationError}
        disabled={isUpdating}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            onSave();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }
        }}
      />
    </TextInputGroup>
    <ActionList isIconList>
      <ActionListItem>
        <Button
          variant="plain"
          aria-label={t('chat.header.cancelEdit')}
          icon={<TimesIcon />}
          onClick={onCancel}
          isDisabled={isUpdating}
        />
      </ActionListItem>
      <ActionListItem>
        <Button
          variant="plain"
          aria-label={t('chat.header.saveTitle')}
          icon={isUpdating ? <Spinner size="md" /> : <CheckIcon />}
          onClick={onSave}
          isDisabled={isUpdating}
        />
      </ActionListItem>
    </ActionList>
  </>
);

export const EditableChatHeader: React.FC<EditableChatHeaderProps> = ({
  variant = 'default',
  title: titleProp,
  conversationId: conversationIdProp,
  onDeleteClick,
}) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const activeConversation = useActiveConversation();
  const conversationId = conversationIdProp ?? activeConversation?.id;
  const { updateTitle, isUpdating, error: apiError, clearError } = useUpdateConversationTitle();

  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [localError, setLocalError] = useState<string | null>(null);
  const originalTitleRef = useRef<string>(title);

  // sync title with prop, active conversation, or default
  useEffect(() => {
    if (isEditing) {
      return;
    }
    if (titleProp !== undefined && titleProp !== '') {
      setTitle(titleProp);
    } else if (activeConversation?.title) {
      setTitle(activeConversation.title);
    } else {
      setTitle(t('chat.defaultTitle'));
    }
  }, [titleProp, activeConversation?.title, isEditing, t]);

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

  const hasError = Boolean(apiError || localError);
  const errorAlert = hasError ? (
    <Alert
      variant={AlertVariant.danger}
      title={t('chat.header.error.updateFailed')}
      isInline
      className="pf-v6-u-mb-md"
    >
      {localError || apiError}
    </Alert>
  ) : null;

  const editFormInner = editFormInputAndButtons(
    title,
    validationError,
    isUpdating,
    handleInputChange,
    handleSave,
    handleCancel,
    t,
  );
  const editForm = (
    <Tooltip
      trigger="manual"
      isVisible={!!validationError}
      position="top"
      content={validationError}
    >
      {editFormInner}
    </Tooltip>
  );

  const dropdownContent = (
    renameOnClick: (e?: React.MouseEvent) => void,
    deleteOnClick?: (e?: React.MouseEvent) => void,
  ) => (
    <DropdownList>
      <DropdownItem value="rename" onClick={renameOnClick}>
        {t('chat.rename')}
      </DropdownItem>
      {deleteOnClick && (
        <>
          <Divider component="li" key="separator" />
          <DropdownItem value="delete" onClick={deleteOnClick}>
            {t('chat.header.delete')}
          </DropdownItem>
        </>
      )}
    </DropdownList>
  );

  if (variant === 'inline') {
    return (
      <div className="pf-v6-u-display-flex pf-v6-u-flex-direction-column pf-v6-u-w-100">
        {errorAlert}
        <div
          className="pf-v6-u-display-flex pf-v6-u-align-items-center"
          onClick={(e) => isEditing && e.stopPropagation()}
        >
          {isEditing ? (
            editForm
          ) : (
            <>
              <span className="genie-editable-chat-header__title">{title}</span>
              <span
                className="genie-editable-chat-header__actions"
                onClick={(e) => e.stopPropagation()}
              >
                <Dropdown
                  isOpen={isDropdownOpen}
                  onOpenChange={setIsDropdownOpen}
                  isPlain
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <Tooltip
                      content={t('chat.header.moreActions')}
                      position="bottom"
                      enableFlip={false}
                    >
                      <MenuToggle
                        ref={toggleRef}
                        aria-label={t('chat.header.moreActions')}
                        variant="plain"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropdownOpen((prev) => !prev);
                        }}
                        isExpanded={isDropdownOpen}
                        icon={<EllipsisHIcon />}
                      />
                    </Tooltip>
                  )}
                  shouldFocusToggleOnSelect
                >
                  {dropdownContent(
                    (e) => {
                      e?.stopPropagation?.();
                      setIsDropdownOpen(false);
                      onEditClick();
                    },
                    conversationId && onDeleteClick
                      ? (e) => {
                          e?.stopPropagation?.();
                          setIsDropdownOpen(false);
                          onDeleteClick({ id: conversationId, title });
                        }
                      : undefined,
                  )}
                </Dropdown>
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {errorAlert}
      <ChatbotHeader>
        <ChatbotHeaderMain>
          <span className="chat-header-icon">
            <RhStandardThoughtBubbleIcon />
          </span>
          {isEditing ? (
            editForm
          ) : (
            <Button
              variant="plain"
              isInline
              onClick={onEditClick}
              aria-label={t('chat.header.editTitle')}
            >
              {title}
            </Button>
          )}
        </ChatbotHeaderMain>
        <ChatbotHeaderActions>
          {!isEditing && (
            <ChatbotHeaderOptionsDropdown
              isCompact
              tooltipProps={{ content: t('chat.header.moreActions') }}
              toggleProps={{ 'aria-label': t('chat.header.moreActions'), isDisabled: false }}
            >
              {dropdownContent(
                onEditClick,
                conversationId && onDeleteClick
                  ? () => onDeleteClick({ id: conversationId, title })
                  : undefined,
              )}
            </ChatbotHeaderOptionsDropdown>
          )}
        </ChatbotHeaderActions>
      </ChatbotHeader>
    </>
  );
};

export default EditableChatHeader;
