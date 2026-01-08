import { useRef, useState } from 'react';
import {
  ChatbotHeader,
  ChatbotHeaderMain,
  ChatbotHeaderActions,
  ChatbotHeaderOptionsDropdown,
} from '@patternfly/chatbot';
import {
  ActionList,
  ActionListItem,
  Button,
  DropdownItem,
  DropdownList,
  TextInputGroup,
  TextInputGroupMain,
  Tooltip,
} from '@patternfly/react-core';
import { RhStandardThoughtBubbleIcon, CheckIcon, TimesIcon } from '@patternfly/react-icons';
import './EditableChatHeader.css';

export const EditableChatHeader: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  // TODO: Get title from API
  const [title, setTitle] = useState<string>('Chat title');
  const [error, setError] = useState<string | undefined>();
  const originalTitleRef = useRef<string>(title);

  const onEditClick = () => {
    originalTitleRef.current = title;
    setIsEditing(true);
  };

  const handleInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setTitle(value);
    if (error && value.trim()) {
      setError(undefined);
    }
  };

  return (
    <ChatbotHeader className="editable-chat-header">
      <ChatbotHeaderMain>
        <span className="chat-header-icon">
          <RhStandardThoughtBubbleIcon />
        </span>
        <div className="chat-header-title">
          {isEditing ? (
            <Tooltip trigger="manual" isVisible={!!error} position="top" content={error}>
              <div className="chat-title-editor">
                <TextInputGroup>
                  <TextInputGroupMain
                    value={title}
                    onChange={handleInputChange}
                    aria-label="Edit conversation title"
                    aria-invalid={!!error}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const next = title.trim();
                        if (!next) {
                          setError('Title cannot be empty.');
                          return;
                        }
                        setIsEditing(false);
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
                      onClick={() => {
                        setIsEditing(false);
                        setTitle(originalTitleRef.current);
                        setError(undefined);
                      }}
                    />
                  </ActionListItem>
                  <ActionListItem>
                    <Button
                      variant="plain"
                      aria-label="Save title"
                      icon={<CheckIcon />}
                      onClick={() => {
                        const next = title.trim();
                        if (!next) {
                          setError('Title cannot be empty.');
                          return;
                        }
                        setIsEditing(false);
                      }}
                    />
                  </ActionListItem>
                </ActionList>
              </div>
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
        </div>
      </ChatbotHeaderMain>
      <ChatbotHeaderActions>
        {!isEditing && (
          <ChatbotHeaderOptionsDropdown
            isCompact
            tooltipProps={{ content: 'More actions' }}
            toggleProps={{ 'aria-label': 'kebab dropdown toggle', isDisabled: false }}
          >
            <DropdownList>
              <DropdownItem value="rename" onClick={onEditClick}>
                Rename
              </DropdownItem>
            </DropdownList>
          </ChatbotHeaderOptionsDropdown>
        )}
      </ChatbotHeaderActions>
    </ChatbotHeader>
  );
};

export default EditableChatHeader;
