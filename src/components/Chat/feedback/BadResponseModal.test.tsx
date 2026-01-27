import type { ReactElement } from 'react';
import {
  render,
  screen,
  user,
  renderWithoutProviders,
  waitFor,
  within,
} from '../../../unitTestUtils';
import {
  BadResponseModalProvider,
  useBadResponseModal,
  BadResponseModal,
} from './BadResponseModal';
import { ToastAlertProvider } from '../../toast-alerts/ToastAlertProvider';
import { AIStateProvider } from '../../../hooks/AIState';
import { stateManager } from '../../utils/aiStateManager';
import type { FeedbackRequest, Message } from '../../../hooks/AIState';

// Mock the feedbackHooks module
jest.mock('../../../hooks/AIState/feedbackHooks', () => ({
  ...jest.requireActual('../../../hooks/AIState/feedbackHooks'),
  useSendFeedback: jest.fn(),
}));

// Mock the conversationHooks module
jest.mock('../../../hooks/AIState/conversationHooks', () => ({
  ...jest.requireActual('../../../hooks/AIState/conversationHooks'),
  useActiveConversation: jest.fn(),
}));

import { useSendFeedback } from '../../../hooks/AIState/feedbackHooks';
import { useActiveConversation } from '../../../hooks/AIState/conversationHooks';

const mockSendFeedback = jest.fn();
const mockUseSendFeedback = useSendFeedback as jest.MockedFunction<typeof useSendFeedback>;
const mockUseActiveConversation = useActiveConversation as jest.MockedFunction<
  typeof useActiveConversation
>;

// Mock console.error to avoid cluttering test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Helper component to trigger modal
const TestTrigger = () => {
  const { badResponseModalToggle } = useBadResponseModal();

  const mockMessage: Message = {
    id: 'test-message-1',
    answer: 'This is a bot response',
    role: 'bot',
    date: new Date(),
  };

  return <button onClick={() => badResponseModalToggle(mockMessage)}>Open Modal</button>;
};

// Custom wrapper with all required providers
const renderWithAllProviders = (ui: ReactElement) => {
  return renderWithoutProviders(
    <AIStateProvider stateManager={stateManager}>
      <ToastAlertProvider>
        <BadResponseModalProvider>{ui}</BadResponseModalProvider>
      </ToastAlertProvider>
    </AIStateProvider>,
  );
};

describe('<BadResponseModal />', () => {
  beforeEach(() => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: null,
      success: false,
    });

    mockUseActiveConversation.mockReturnValue({
      id: 'conversation-1',
      messages: [
        {
          id: 'user-message-1',
          answer: 'User question to the bot',
          role: 'user',
          date: new Date(),
        },
        {
          id: 'test-message-1',
          answer: 'This is a bot response',
          role: 'bot',
          date: new Date(),
        },
      ],
      title: 'Test Conversation',
      locked: false,
      createdAt: new Date(),
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error when useBadResponseModal is used outside of provider', () => {
    const ComponentWithoutProvider = () => {
      useBadResponseModal();
      return <div>Test</div>;
    };

    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      'useBadResponseModal must be used within a BadResponseModalProvider',
    );
  });

  it('displays error alert when sendFeedback returns error', async () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: 'This is an error',
      success: false,
    });

    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));

    // Wait for modal to appear
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Modal should remain open on error
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(within(screen.getByRole('alert')).getByText('This is an error')).toBeInTheDocument();
  });

  it('clears error when modal is reopened', async () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: 'This is an error',
      success: false,
    });
    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Verify error appears
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Close modal
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: null,
      success: false,
    });

    // Reopen modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls sendFeedback when form is submitted', async () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: null,
      success: false,
    });

    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(mockSendFeedback).not.toHaveBeenCalled();
    // Submit form
    await user.click(screen.getByRole('radio', { name: /Incorrect/i }));
    await user.type(screen.getByRole('textbox'), 'User entered feedback');
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // KKD this fails but we need to mock the  const activeConversation = useActiveConversation();
    // So we can test if the correct data is passed to sendFeedback
    // Also need to set an free text area for the user feedback
    expect(mockSendFeedback).toHaveBeenCalledWith({
      conversation_id: 'conversation-1',
      user_question: 'User question to the bot',
      llm_response: 'This is a bot response',
      categories: ['incorrect'],
      user_feedback: 'User entered feedback',
      sentiment: -1,
    } as FeedbackRequest);
  });

  it('displays success alert and closes modal when submission succeeds', async () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: null,
      success: true,
    });

    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(screen.getByText('Feedback submitted')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
