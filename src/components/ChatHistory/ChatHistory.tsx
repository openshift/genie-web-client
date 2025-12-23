import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateFooter,
  List,
  ListItem,
  Skeleton,
} from '@patternfly/react-core';
import { PlusSquareIcon } from '@patternfly/react-icons';
import type { Conversation } from '@redhat-cloud-services/ai-client-state';
import { useConversations, useIsInitializing } from '@redhat-cloud-services/ai-react-state';
import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useDrawer } from '../drawer';
import { ChatNew, mainGenieRoute, SubRoutes } from '../routeList';
import { ChatHistorySearch } from './ChatHistorySearch';
import { groupByDate } from './dateHelpers';

/**
 * Filters conversations by search term (case-insensitive, matches anywhere in title)
 */
const filterConversations = (conversations: Conversation[], searchTerm: string): Conversation[] => {
  if (!searchTerm.trim()) {
    return conversations;
  }
  const lowerSearchTerm = searchTerm.toLowerCase();
  return conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(lowerSearchTerm),
  );
};

interface ChatHistoryGroupProps {
  titleKey: 'today' | 'yesterday' | 'lastWeek' | 'older';
  conversations: Conversation[];
  isLoading: boolean;
  onClick: (conversation: Conversation) => void;
}

const ChatHistoryGroup = ({
  titleKey,
  conversations,
  isLoading,
  onClick,
}: ChatHistoryGroupProps) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const title = t(`chatHistory.group.${titleKey}`);

  const handleClick = useCallback(
    (conversation: Conversation) => {
      onClick(conversation);
    },
    [onClick],
  );

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
            <ListItem key={conversation.id}>
              <Button
                variant={ButtonVariant.link}
                role="link"
                onClick={() => handleClick(conversation)}
                isBlock
                style={{ justifyContent: 'flex-start' }} /* temp styling until we add actions */
              >
                {conversation.title}
              </Button>
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
  const conversations = useConversations();
  const isInitializing = useIsInitializing();
  const { closeDrawer } = useDrawer();
  const { t } = useTranslation('plugin__genie-web-client');

  const [searchTerm, setSearchTerm] = useState<string>('');

  const allConversations = (conversations as unknown as Conversation[]) || [];
  const filteredConversations = useMemo(
    () => filterConversations(allConversations, searchTerm),
    [allConversations, searchTerm],
  );

  const groupedConversations = useMemo(
    () => groupByDate(filteredConversations),
    [filteredConversations],
  );

  // No conversations available
  if (!isInitializing && conversations !== undefined && conversations.length === 0) {
    return <EmptyStateComponent />;
  }

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

  const handleConversationClick = (conversation: Conversation) => {
    navigate(`${mainGenieRoute}/${SubRoutes.Chat}/${conversation.id}`);
    closeDrawer();
  };

  const hasSearchResults = useMemo(
    () =>
      groupedConversations.today.length > 0 ||
      groupedConversations.yesterday.length > 0 ||
      groupedConversations.lastWeek.length > 0 ||
      groupedConversations.other.length > 0,
    [groupedConversations],
  );

  return (
    <>
      {!isInitializing && (
        <ChatHistorySearch onSearch={setSearchTerm} resultsCount={filteredConversations.length} />
      )}
      {searchTerm.trim() && !hasSearchResults && !isInitializing ? (
        <EmptyState
          variant={EmptyStateVariant.sm}
          titleText={t('chatHistory.noResults.heading')}
          headingLevel="h4"
        >
          <EmptyStateBody>{t('chatHistory.noResults.description', { searchTerm })}</EmptyStateBody>
        </EmptyState>
      ) : (
        <>
          <ChatHistoryGroup
            titleKey="today"
            conversations={groupedConversations.today}
            isLoading={isInitializing}
            onClick={handleConversationClick}
          />
          <ChatHistoryGroup
            titleKey="yesterday"
            conversations={groupedConversations.yesterday}
            isLoading={isInitializing}
            onClick={handleConversationClick}
          />
          <ChatHistoryGroup
            titleKey="lastWeek"
            conversations={groupedConversations.lastWeek}
            isLoading={isInitializing}
            onClick={handleConversationClick}
          />
          <ChatHistoryGroup
            titleKey="older"
            conversations={groupedConversations.other}
            isLoading={isInitializing}
            onClick={handleConversationClick}
          />
        </>
      )}
    </>
  );
};
