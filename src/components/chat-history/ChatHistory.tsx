import {
  Alert,
  AlertVariant,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateFooter,
  List,
  ListItem,
  Skeleton,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { PlusSquareIcon } from '@patternfly/react-icons';
import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import {
  Conversation,
  useActiveConversation,
  useConversations,
  useDeleteConversationModal,
  useIsInitializing,
} from '../../hooks/AIState';
import { useDrawer } from '../drawer';
import { ChatNew, mainGenieRoute, SubRoutes } from '../routeList';
import { ChatHistorySearch } from './ChatHistorySearch';
import { groupByDate } from './dateHelpers';
import EditableChatHeader from '../chat/EditableChatHeader';
import { DeleteConversationModal } from '../chat/DeleteConversationModal';
import { isTempConversationId } from '../../utils/conversationUtils';
import './ChatHistory.css';

const filterConversations = (conversations: Conversation[], searchTerm: string): Conversation[] => {
  // First filter out temporary conversations
  const nonTempConversations = conversations.filter(
    (conversation) => !isTempConversationId(conversation.id),
  );

  if (!searchTerm.trim()) {
    return nonTempConversations;
  }
  const lowerSearchTerm = searchTerm.toLowerCase();
  return nonTempConversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(lowerSearchTerm),
  );
};

interface ChatHistoryGroupProps {
  titleKey: 'today' | 'yesterday' | 'lastWeek' | 'older';
  conversations: Conversation[];
  isLoading: boolean;
  onRowActivate?: (conversation: Conversation) => void;
  onDeleteClick?: (conversation: Pick<Conversation, 'id' | 'title'>) => void;
}

const ChatHistoryGroup = ({
  titleKey,
  conversations,
  isLoading,
  onRowActivate,
  onDeleteClick,
}: ChatHistoryGroupProps) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const title = t(`chatHistory.group.${titleKey}`);

  if (!isLoading && conversations.length === 0) {
    return null;
  }
  return (
    <div className="pf-v6-u-mt-lg">
      <h2>{title}</h2>
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <List isPlain>
          {conversations.map((conversation) => (
            <ListItem
              key={conversation.id}
              className="genie-chat-history-item__row"
              role="group"
              tabIndex={0}
              aria-label={`${conversation.title} - ${t('chat.header.openChat')}`}
              onClick={() => onRowActivate?.(conversation)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                const target = e.target as HTMLElement;
                const isEditableOrButton =
                  target instanceof HTMLButtonElement ||
                  target instanceof HTMLInputElement ||
                  target instanceof HTMLTextAreaElement ||
                  target.isContentEditable;
                if (isEditableOrButton) {
                  return;
                }
                e.preventDefault();
                onRowActivate?.(conversation);
              }}
            >
              <EditableChatHeader
                title={conversation.title}
                variant="inline"
                conversationId={conversation.id}
                onDeleteClick={onDeleteClick}
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

const EmptyStateComponent: React.FC = () => {
  const navigate = useNavigate();
  const { closeDrawer } = useDrawer();
  const { t } = useTranslation('plugin__genie-web-client');

  const handleNewChatClick = useCallback(() => {
    closeDrawer();
    navigate(`${mainGenieRoute}/${ChatNew}`);
  }, [closeDrawer, navigate]);

  return (
    <EmptyState
      variant={EmptyStateVariant.lg}
      titleText={t('chatHistory.emptyState.heading')}
      headingLevel="h4"
    >
      <EmptyStateBody>{t('chatHistory.emptyState.description')}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="primary" icon={<PlusSquareIcon />} onClick={handleNewChatClick}>
            {t('chatHistory.emptyState.cta')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

const LoadingComponent: React.FC = () => {
  const { t } = useTranslation('plugin__genie-web-client');
  return (
    <>
      <Skeleton screenreaderText={t('chatHistory.loading')} />
      <Skeleton className="pf-v6-u-mt-md" />
      <Skeleton className="pf-v6-u-mt-md" />
    </>
  );
};

export const ChatHistory: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const conversations = useConversations();
  const isInitializing = useIsInitializing();
  const activeConversation = useActiveConversation();
  const { closeDrawer } = useDrawer();
  const {
    conversationToDelete,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    isDeleting,
    error: deleteError,
  } = useDeleteConversationModal({
    onDeleted: (deletedId) => {
      closeDrawer();
      const wasActiveConversation = activeConversation?.id === deletedId;
      const wasLastConversation = (conversations?.length ?? 0) === 1;
      const newChatPath = `${mainGenieRoute}/${ChatNew}`;
      const alreadyOnNewChat = pathname.endsWith(newChatPath);
      if (!alreadyOnNewChat && (wasActiveConversation || wasLastConversation)) {
        navigate(newChatPath, { replace: true });
      }
    },
  });
  const { t } = useTranslation('plugin__genie-web-client');

  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleNewChatClick = useCallback(() => {
    closeDrawer();
    navigate(`${mainGenieRoute}/${ChatNew}`);
  }, [closeDrawer, navigate]);

  const handleRowActivate = (conversation: Conversation) => {
    navigate(`${mainGenieRoute}/${SubRoutes.Chat}/${conversation.id}`);
    closeDrawer();
  };

  // There has been a type of error getting conversations
  if (!isInitializing && conversations === undefined) {
    // TODO: Determine if there is a better way to determining if there is an error
    // TODO: Verify error state design and behavior
    return (
      <Alert variant={AlertVariant.danger} title={t('chatHistory.error.heading')} role="alert">
        <p>{t('chatHistory.error.description')}</p>
      </Alert>
    );
  }

  const allConversations = (conversations as unknown as Conversation[]) || [];
  const filteredConversations = useMemo(
    () => filterConversations(allConversations, searchTerm),
    [allConversations, searchTerm],
  );

  const groupedConversations = useMemo(
    () => groupByDate(filteredConversations),
    [filteredConversations],
  );

  // There has been a type of error getting conversations
  if (!isInitializing && conversations === undefined) {
    // TODO: Determine if there is a better way to determining if there is an error
    // TODO: Verify error state design and behavior
    return (
      <Alert variant={AlertVariant.danger} title={t('chatHistory.error.heading')} role="alert">
        <p>{t('chatHistory.error.description')}</p>
      </Alert>
    );
  }

  const hasSearchResults = useMemo(
    () =>
      groupedConversations.today.length > 0 ||
      groupedConversations.yesterday.length > 0 ||
      groupedConversations.lastWeek.length > 0 ||
      groupedConversations.other.length > 0,
    [groupedConversations],
  );

  const isEmpty =
    !isInitializing &&
    conversations !== undefined &&
    filteredConversations.length === 0 &&
    !searchTerm.trim();

  return (
    <div className="genie-chat-history">
      {conversationToDelete && (
        <DeleteConversationModal
          conversation={conversationToDelete}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
          error={deleteError}
        />
      )}
      {isEmpty ? (
        <EmptyStateComponent />
      ) : (
        <>
          {!isInitializing && (
            <Split hasGutter>
              <SplitItem isFilled>
                <ChatHistorySearch
                  onSearch={setSearchTerm}
                  resultsCount={filteredConversations.length}
                />
              </SplitItem>
              <SplitItem>
                <Button
                  variant="control"
                  icon={<PlusSquareIcon />}
                  onClick={handleNewChatClick}
                  aria-label="New Chat"
                />
              </SplitItem>
            </Split>
          )}
          {searchTerm.trim() && !hasSearchResults && !isInitializing ? (
            <EmptyState
              variant={EmptyStateVariant.sm}
              titleText={t('chatHistory.noResults.heading')}
              headingLevel="h4"
            >
              <EmptyStateBody>
                {t('chatHistory.noResults.description', { searchTerm })}
              </EmptyStateBody>
            </EmptyState>
          ) : (
            <>
              <ChatHistoryGroup
                titleKey="today"
                conversations={groupedConversations.today}
                isLoading={isInitializing}
                onRowActivate={handleRowActivate}
                onDeleteClick={openDeleteModal}
              />
              <ChatHistoryGroup
                titleKey="yesterday"
                conversations={groupedConversations.yesterday}
                isLoading={isInitializing}
                onRowActivate={handleRowActivate}
                onDeleteClick={openDeleteModal}
              />
              <ChatHistoryGroup
                titleKey="lastWeek"
                conversations={groupedConversations.lastWeek}
                isLoading={isInitializing}
                onRowActivate={handleRowActivate}
                onDeleteClick={openDeleteModal}
              />
              <ChatHistoryGroup
                titleKey="older"
                conversations={groupedConversations.other}
                isLoading={isInitializing}
                onRowActivate={handleRowActivate}
                onDeleteClick={openDeleteModal}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
