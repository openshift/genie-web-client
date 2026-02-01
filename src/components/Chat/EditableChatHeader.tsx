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
import { useChatConversation } from '../../hooks/useChatConversation';

export const EditableChatHeader: React.FC = () => {
  const { t } = useTranslation('plugin__genie-web-client');
  const {
    title,
    titleEditState,
    startEditingTitle,
    cancelEditingTitle,
    updateTitleValue,
    saveTitle,
  } = useChatConversation();

  const { isEditing, editValue, validationError, apiError, isUpdating } = titleEditState;

  const displayTitle = title || t('chat.defaultTitle');

  const handleInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    updateTitleValue(value);
  };

  return (
    <>
      {apiError ? (
        <Alert
          variant={AlertVariant.danger}
          title={t('chat.header.error.updateFailed')}
          isInline
          className="pf-v6-u-mb-md"
        >
          {apiError}
        </Alert>
      ) : null}
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
                    value={editValue}
                    onChange={handleInputChange}
                    aria-label="Edit conversation title"
                    aria-invalid={!!validationError}
                    disabled={isUpdating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        saveTitle();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        cancelEditingTitle();
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
                      onClick={cancelEditingTitle}
                      isDisabled={isUpdating}
                    />
                  </ActionListItem>
                  <ActionListItem>
                    <Button
                      variant="plain"
                      aria-label="Save title"
                      icon={isUpdating ? <Spinner size="md" /> : <CheckIcon />}
                      onClick={saveTitle}
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
              onClick={startEditingTitle}
              aria-label="Edit conversation title"
            >
              {displayTitle}
            </Button>
          )}
        </ChatbotHeaderMain>
        <ChatbotHeaderActions>
          {!isEditing ? (
            <ChatbotHeaderOptionsDropdown
              isCompact
              tooltipProps={{ content: t('chat.header.moreActions') }}
              toggleProps={{ 'aria-label': 'kebab dropdown toggle', isDisabled: false }}
            >
              <DropdownList>
                <DropdownItem value="rename" onClick={startEditingTitle}>
                  {t('chat.rename')}
                </DropdownItem>
              </DropdownList>
            </ChatbotHeaderOptionsDropdown>
          ) : null}
        </ChatbotHeaderActions>
      </ChatbotHeader>
    </>
  );
};

export default EditableChatHeader;
