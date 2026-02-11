import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatbotHeader, ChatbotHeaderMain, ChatbotHeaderActions } from '@patternfly/chatbot';
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
  RhStandardPencilIcon,
  RhStandardTrashcanIcon,
  CheckIcon,
  TimesIcon,
  EllipsisHIcon,
  EllipsisVIcon,
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
  isDropdownOpen?: boolean;
  onDropdownOpenChange?: (open: boolean) => void;
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
  isDropdownOpen: isDropdownOpenControlled,
  onDropdownOpenChange,
}) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const activeConversation = useActiveConversation();
  const conversationId = conversationIdProp ?? activeConversation?.id;
  const { updateTitle, isUpdating, error: apiError, clearError } = useUpdateConversationTitle();

  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpenLocal, setIsDropdownOpenLocal] = useState(false);
  const isDropdownOpen = isDropdownOpenControlled ?? isDropdownOpenLocal;
  const setIsDropdownOpen = onDropdownOpenChange ?? setIsDropdownOpenLocal;
  const [title, setTitle] = useState<string>('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [localError, setLocalError] = useState<string | null>(null);
  const originalTitleRef = useRef<string>(title);

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
      {variant === 'inline' ? (
        <>{editFormInner}</>
      ) : (
        <div className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-flex-wrap-nowrap pf-v6-u-w-100 pf-v6-u-min-width">
          {editFormInner}
        </div>
      )}
    </Tooltip>
  );

  const dropdownContent = (
    renameOnClick: (e?: React.MouseEvent) => void,
    deleteOnClick?: (e?: React.MouseEvent) => void,
  ) => (
    <DropdownList>
      <DropdownItem value="rename" onClick={renameOnClick}>
        <span className="genie-editable-chat-header__dropdown-item">
          <RhStandardPencilIcon />
          {t('chat.rename')}
        </span>
      </DropdownItem>
      {deleteOnClick && (
        <>
          <Divider component="li" key="separator" />
          <DropdownItem value="delete" onClick={deleteOnClick}>
            <span className="genie-editable-chat-header__dropdown-item">
              <RhStandardTrashcanIcon />
              {t('chat.header.delete')}
            </span>
          </DropdownItem>
        </>
      )}
    </DropdownList>
  );

  const handleRenameClick = (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    setIsDropdownOpen(false);
    onEditClick();
  };
  const handleDeleteClick =
    conversationId && onDeleteClick
      ? (e?: React.MouseEvent) => {
          e?.stopPropagation?.();
          setIsDropdownOpen(false);
          onDeleteClick({ id: conversationId, title });
        }
      : undefined;

  const isInline = variant === 'inline';
  const actionsDropdown = (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <Tooltip content={t('chat.header.moreActions')} position="bottom" enableFlip={false}>
          <MenuToggle
            ref={toggleRef}
            className={isInline ? undefined : 'pf-chatbot__button--toggle-options pf-m-compact'}
            aria-label={t('chat.header.moreActions')}
            variant="plain"
            isCircle={isInline}
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            isExpanded={isDropdownOpen}
            icon={isInline ? <EllipsisHIcon /> : <EllipsisVIcon />}
          />
        </Tooltip>
      )}
      shouldFocusToggleOnSelect
      shouldFocusFirstItemOnOpen={!isInline}
      popperProps={
        isInline
          ? { appendTo: 'inline', position: 'end' as const }
          : { position: 'right' as const, preventOverflow: true, appendTo: 'inline' }
      }
    >
      {dropdownContent(handleRenameClick, handleDeleteClick)}
    </Dropdown>
  );

  if (variant === 'inline') {
    const wrappedActions = (
      <span className="genie-editable-chat-header__actions">{actionsDropdown}</span>
    );
    if (!isEditing) {
      return (
        <>
          {errorAlert}
          <span className="genie-editable-chat-header__title">{title}</span>
          {wrappedActions}
        </>
      );
    }
    return (
      <div className="pf-v6-u-display-flex pf-v6-u-flex-direction-column pf-v6-u-w-100">
        {errorAlert}
        <div
          className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-flex-wrap-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          {editForm}
          {wrappedActions}
        </div>
      </div>
    );
  }

  return (
    <>
      {errorAlert}
      <ChatbotHeader>
        <ChatbotHeaderMain className="pf-v6-u-min-width">
          <span className="chat-header-icon">
            <RhStandardThoughtBubbleIcon />
          </span>
          <span className="genie-editable-chat-header__title">
            {isEditing ? (
              editForm
            ) : (
              <Button
                variant="plain"
                isInline
                onClick={onEditClick}
                aria-label={t('chat.header.editTitle')}
              >
                <span className="genie-editable-chat-header__title">{title}</span>
              </Button>
            )}
          </span>
        </ChatbotHeaderMain>
        <ChatbotHeaderActions>{actionsDropdown}</ChatbotHeaderActions>
      </ChatbotHeader>
    </>
  );
};

export default EditableChatHeader;
