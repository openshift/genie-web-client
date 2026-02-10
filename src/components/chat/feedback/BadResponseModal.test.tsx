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

  it('displays validation error when submitting without selecting feedback type', async () => {
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

    // Try to submit without selecting a feedback type
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Validation error should appear
    expect(await screen.findByText('Select a feedback type')).toBeInTheDocument();
    expect(mockSendFeedback).not.toHaveBeenCalled();
  });

  it('clears validation error when feedback type is selected', async () => {
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

    // Try to submit without selecting a feedback type
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Validation error should appear
    expect(await screen.findByText('Select a feedback type')).toBeInTheDocument();

    // Select a feedback type
    await user.click(screen.getByRole('radio', { name: /Incorrect/i }));

    // Validation error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Select a feedback type')).not.toBeInTheDocument();
    });
  });

  it('focuses on validation alert when displayed', async () => {
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

    // Try to submit without selecting a feedback type
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Validation error should appear and receive focus
    const validationAlert = await screen.findByText('Select a feedback type');
    await waitFor(() => {
      // The wrapper div (parent of the alert) should have focus
      const wrapper = validationAlert.closest('[role="alert"]')?.parentElement;
      expect(wrapper).toHaveFocus();
    });
  });

  it('focuses on error alert when API error occurs', async () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: 'Network error occurred',
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

    // Error alert should appear and receive focus
    const errorAlert = await screen.findByText('Network error occurred');
    await waitFor(() => {
      // The wrapper div (parent of the alert) should have focus
      const wrapper = errorAlert.closest('[role="alert"]')?.parentElement;
      expect(wrapper).toHaveFocus();
    });
  });

  it('calls sendFeedback when form is submitted with feedback type', async () => {
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

    expect(mockSendFeedback).toHaveBeenCalledWith({
      conversation_id: 'conversation-1',
      user_question: 'User question to the bot',
      llm_response: 'This is a bot response',
      categories: ['incorrect'],
      user_feedback: 'User entered feedback',
      sentiment: -1,
    } as FeedbackRequest);
  });

  it('calls sendFeedback without optional user feedback', async () => {
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

    // Submit form without entering user feedback
    await user.click(screen.getByRole('radio', { name: /Unhelpful/i }));
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(mockSendFeedback).toHaveBeenCalledWith({
      conversation_id: 'conversation-1',
      user_question: 'User question to the bot',
      llm_response: 'This is a bot response',
      categories: ['not_relevant'],
      user_feedback: '',
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
    expect(screen.getByText('Feedback received')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disables form fields when loading', async () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: true,
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

    // Radio buttons should be disabled
    expect(screen.getByRole('radio', { name: /Incorrect/i })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Unhelpful/i })).toBeDisabled();

    // Textarea should be disabled and read-only
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders all feedback type options', async () => {
    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // All feedback types should be present
    expect(screen.getByRole('radio', { name: /Incorrect/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Unhelpful/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Incomplete/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Harmful/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Other/i })).toBeInTheDocument();
  });

  it('displays disclaimer text', async () => {
    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Disclaimer should be visible
    expect(screen.getByText(/A human team will review your report/i)).toBeInTheDocument();
  });
});
