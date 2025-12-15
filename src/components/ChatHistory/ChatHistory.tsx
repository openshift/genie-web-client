import {
  EmptyStateActions,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateFooter,
  Skeleton,
  List,
  ListItem,
  AlertVariant,
  Alert,
} from '@patternfly/react-core';
import { PlusSquareIcon } from '@patternfly/react-icons';
import { Conversation } from '@redhat-cloud-services/ai-client-state';
import { useDrawer } from '../drawer';

import { useConversations, useIsInitializing } from '@redhat-cloud-services/ai-react-state';
import { mainGenieRoute, ChatNew, SubRoutes } from '../routeList';
import { useNavigate } from 'react-router-dom-v5-compat';
import { groupByDate } from './dateHelpers';
import { ChatHistorySearch } from './ChatHistorySearch';
import { useMemo, useState } from 'react';

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

const ChatHistoryGroup = ({
  title,
  conversations,
  isLoading,
  onClick,
}: {
  title: 'Today' | 'Yesterday' | 'Last Week' | 'Older';
  conversations: Conversation[];
  isLoading: boolean;
  onClick: (conversation: Conversation) => void;
}) => {
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
                onClick={() => onClick(conversation)}
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
  return (
    <EmptyState variant={EmptyStateVariant.lg} titleText="Ready to chat?" headingLevel="h4">
      <EmptyStateBody>
        Your chat history is currently empty. Start a new conversation and we&apos;ll keep a record
        of it for you here.
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            variant="primary"
            icon={<PlusSquareIcon />}
            onClick={() => {
              closeDrawer();
              navigate(`${mainGenieRoute}/${ChatNew}`);
            }}
          >
            Start your first chat
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

const LoadingComponent: React.FC = () => {
  return (
    <>
      <Skeleton screenreaderText="Loading conversation history" />
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
      <Alert variant={AlertVariant.danger} title="Error loading conversations" role="alert">
        <p>
          There was an error loading your conversations. Please try again later or try refreshing
          the page.
        </p>
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
        <EmptyState variant={EmptyStateVariant.sm} titleText="No results found" headingLevel="h4">
          <EmptyStateBody>
            No conversations match your search &quot;{searchTerm}&quot;. Try adjusting your search
            terms.
          </EmptyStateBody>
        </EmptyState>
      ) : (
        <>
          <ChatHistoryGroup
            title="Today"
            conversations={groupedConversations.today}
            isLoading={isInitializing}
            onClick={handleConversationClick}
          />
          <ChatHistoryGroup
            title="Yesterday"
            conversations={groupedConversations.yesterday}
            isLoading={isInitializing}
            onClick={handleConversationClick}
          />
          <ChatHistoryGroup
            title="Last Week"
            conversations={groupedConversations.lastWeek}
            isLoading={isInitializing}
            onClick={handleConversationClick}
          />
          <ChatHistoryGroup
            title="Older"
            conversations={groupedConversations.other}
            isLoading={isInitializing}
            onClick={handleConversationClick}
          />
        </>
      )}
    </>
  );
};
