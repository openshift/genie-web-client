import { render, screen, user, within, waitFor } from '../../unitTestUtils';
import { ChatHistory } from './ChatHistory';

import { Conversation } from '../../hooks/AIState';
import { getConversations } from './conversations.mock';
import { mainGenieRoute, SubRoutes, ChatNew } from '../routeList';

// Mock the hooks
const mockUseConversations = jest.fn();
const mockUseIsInitializing = jest.fn();
const mockCloseDrawer = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../hooks/AIState', () => ({
  useConversations: () => mockUseConversations(),
  useIsInitializing: () => mockUseIsInitializing(),
}));

jest.mock('../drawer', () => ({
  useDrawer: () => ({
    closeDrawer: mockCloseDrawer,
  }),
}));

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
}));

describe('ChatHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsInitializing.mockReturnValue(false);
  });

  describe('Empty State', () => {
    it('displays empty state when there are no conversations', () => {
      mockUseConversations.mockReturnValue([]);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      expect(screen.getByText('Ready to chat?')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Start your first chat' })).toBeInTheDocument();
    });

    it('does not render empty state when conversations is undefined and initializing', () => {
      mockUseConversations.mockReturnValue(undefined);
      mockUseIsInitializing.mockReturnValue(true);

      render(<ChatHistory />);

      expect(screen.queryByText('Ready to chat?')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Start your first chat' }),
      ).not.toBeInTheDocument();
    });

    it('navigates to new chat when empty state button is clicked', async () => {
      mockUseConversations.mockReturnValue([]);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      const button = screen.getByRole('button', { name: 'Start your first chat' });
      await user.click(button);

      expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(`${mainGenieRoute}/${ChatNew}`);
    });
  });

  describe('Loading State', () => {
    it('displays loading skeletons when initializing', () => {
      mockUseConversations.mockReturnValue([]);
      mockUseIsInitializing.mockReturnValue(true);

      render(<ChatHistory />);

      const skeletons = screen.getAllByText('Loading conversation history');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows loading state for all groups when initializing', () => {
      mockUseConversations.mockReturnValue([]);
      mockUseIsInitializing.mockReturnValue(true);

      render(<ChatHistory />);

      // Should show loading skeletons for all groups
      // Each group renders a LoadingComponent with one skeleton that has screenreaderText
      const skeletons = screen.getAllByText('Loading conversation history');
      expect(skeletons.length).toBe(4); // One for each group (Today, Yesterday, Last Week, Older)
    });
  });

  describe('Conversation Groups', () => {
    it('displays conversations grouped by date', () => {
      // Mock today's date - using Friday so that 5 days ago (Sunday) is still in the current week
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-17T08:00:00.000Z'));

      const conversations = getConversations();
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      // Check that group titles are rendered
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('Yesterday')).toBeInTheDocument();
      expect(screen.getByText('Last Week')).toBeInTheDocument();
      expect(screen.getByText('Older')).toBeInTheDocument();

      jest.useRealTimers();
    });

    it('does not render empty groups', () => {
      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'Today conversation',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      // Today group should be visible
      expect(screen.getByText('Today')).toBeInTheDocument();
      // Other groups should not be visible if they have no conversations
      expect(screen.queryByText('Yesterday')).not.toBeInTheDocument();
      expect(screen.queryByText('Last Week')).not.toBeInTheDocument();
      expect(screen.queryByText('Older')).not.toBeInTheDocument();
    });

    it('displays conversation titles as clickable links', () => {
      const conversations: Conversation[] = [
        {
          id: 'test-id',
          title: 'Test Conversation',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      expect(screen.getByRole('link', { name: 'Test Conversation' })).toBeInTheDocument();
    });

    it('navigates to conversation when clicked', async () => {
      const conversations: Conversation[] = [
        {
          id: 'test-conversation-id',
          title: 'Test Conversation',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      const conversationLink = screen.getByRole('link', { name: 'Test Conversation' });
      await user.click(conversationLink);

      expect(mockNavigate).toHaveBeenCalledWith(
        `${mainGenieRoute}/${SubRoutes.Chat}/test-conversation-id`,
      );
      expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
    });

    it('handles multiple conversations in different groups', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));

      const conversations: Conversation[] = [
        {
          id: 'today-1',
          title: 'Today 1',
          createdAt: '2025-01-15T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: 'yesterday-1',
          title: 'Yesterday 1',
          createdAt: '2025-01-14T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: 'lastweek-1',
          title: 'Last Week 1',
          createdAt: '2025-01-10T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: 'older-1',
          title: 'Older 1',
          createdAt: '2025-01-01T10:00:00.000Z',
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];

      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      expect(screen.getByRole('link', { name: 'Today 1' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Yesterday 1' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Last Week 1' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Older 1' })).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('Search Functionality', () => {
    it('displays search input when not initializing', () => {
      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'Test Conversation',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      expect(screen.getByPlaceholderText('Find conversation')).toBeInTheDocument();
    });

    it('does not render search input when initializing', () => {
      mockUseConversations.mockReturnValue([]);
      mockUseIsInitializing.mockReturnValue(true);

      render(<ChatHistory />);

      expect(screen.queryByPlaceholderText('Find conversation')).not.toBeInTheDocument();
    });

    it('filters conversations by search term (case-insensitive)', async () => {
      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'JavaScript Tutorial',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
        {
          id: '2',
          title: 'Python Basics',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
        {
          id: '3',
          title: 'Java Advanced',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      // All conversations should be visible initially
      expect(screen.getByRole('link', { name: 'JavaScript Tutorial' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Python Basics' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Java Advanced' })).toBeInTheDocument();

      // Search for "java" (case-insensitive)
      const searchInput = screen.getByPlaceholderText('Find conversation') as HTMLInputElement;
      await user.click(searchInput);
      await user.paste('java');

      // Wait for search to filter results
      await waitFor(
        () => {
          expect(screen.queryByRole('link', { name: 'Python Basics' })).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Should show both JavaScript and Java conversations
      expect(screen.getByRole('link', { name: 'JavaScript Tutorial' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Java Advanced' })).toBeInTheDocument();
    });

    it('filters conversations with partial match anywhere in title', async () => {
      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'React Component Guide',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
        {
          id: '2',
          title: 'Vue.js Tutorial',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
        {
          id: '3',
          title: 'Angular Framework',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      // Search for "component" (partial match in middle of title)
      const searchInput = screen.getByPlaceholderText('Find conversation') as HTMLInputElement;
      await user.click(searchInput);
      await user.paste('component');

      // Wait for search to filter results
      await waitFor(
        () => {
          expect(screen.getByRole('link', { name: 'React Component Guide' })).toBeInTheDocument();
          expect(screen.queryByRole('link', { name: 'Vue.js Tutorial' })).not.toBeInTheDocument();
          expect(screen.queryByRole('link', { name: 'Angular Framework' })).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('shows "no results found" message when search has no matches', async () => {
      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'Test Conversation',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      // Search for something that doesn't match
      const searchInput = screen.getByPlaceholderText('Find conversation') as HTMLInputElement;
      await user.click(searchInput);
      await user.paste('nonexistent');

      // Wait for "no results found" message to appear
      await waitFor(
        () => {
          expect(screen.getByText('No results found')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      expect(
        screen.getByText(/No conversations match your search "nonexistent"/),
      ).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Test Conversation' })).not.toBeInTheDocument();
    });

    it('clears search and shows all conversations when search is cleared', async () => {
      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'First Conversation',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
        {
          id: '2',
          title: 'Second Conversation',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      // Search for "first"
      const searchInput = screen.getByPlaceholderText('Find conversation') as HTMLInputElement;
      await user.click(searchInput);
      await user.paste('first');

      // Wait for search to filter results
      await waitFor(
        () => {
          expect(screen.getByRole('link', { name: 'First Conversation' })).toBeInTheDocument();
          expect(
            screen.queryByRole('link', { name: 'Second Conversation' }),
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Clear the search using the Reset button
      const resetButton = screen.getByRole('button', { name: 'Reset' });
      await user.click(resetButton);

      // Wait for both conversations to be visible again
      await waitFor(
        () => {
          expect(screen.getByRole('link', { name: 'First Conversation' })).toBeInTheDocument();
          expect(screen.getByRole('link', { name: 'Second Conversation' })).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      expect(screen.queryByText('No results found')).not.toBeInTheDocument();
    });

    it('filters conversations across different date groups', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));

      const conversations: Conversation[] = [
        {
          id: 'today-1',
          title: 'Today Python',
          createdAt: '2025-01-15T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: 'yesterday-1',
          title: 'Yesterday Python',
          createdAt: '2025-01-14T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: 'lastweek-1',
          title: 'Last Week Java',
          createdAt: '2025-01-10T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: 'older-1',
          title: 'Older Python',
          createdAt: '2025-01-01T10:00:00.000Z',
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];

      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      // Use real timers for user interactions
      jest.useRealTimers();

      // Search for "python"
      const searchInput = screen.getByPlaceholderText('Find conversation') as HTMLInputElement;
      await user.click(searchInput);
      await user.paste('python');

      // Wait for search to filter results
      await waitFor(
        () => {
          expect(screen.getByRole('link', { name: 'Today Python' })).toBeInTheDocument();
          expect(screen.getByRole('link', { name: 'Yesterday Python' })).toBeInTheDocument();
          expect(screen.getByRole('link', { name: 'Older Python' })).toBeInTheDocument();
          expect(screen.queryByRole('link', { name: 'Last Week Java' })).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('does not show "no results found" when search is empty', () => {
      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'Test Conversation',
          createdAt: new Date().toISOString(),
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      // Should not show "no results found" when search is empty
      expect(screen.queryByText('No results found')).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Test Conversation' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined conversations gracefully (error loading conversations)', () => {
      mockUseConversations.mockReturnValue(undefined);
      mockUseIsInitializing.mockReturnValue(false);

      render(<ChatHistory />);

      expect(
        within(screen.getByRole('alert')).getByText('Error loading conversations'),
      ).toBeInTheDocument();
    });

    it('handles conversations with invalid dates', () => {
      const conversations: Conversation[] = [
        {
          id: 'invalid-date',
          title: 'Invalid Date',
          createdAt: 'invalid-date-string',
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];
      mockUseConversations.mockReturnValue(conversations);
      mockUseIsInitializing.mockReturnValue(false);

      // Should not throw an error
      expect(() => render(<ChatHistory />)).not.toThrow();
    });
  });
});
