import type { ReactElement } from 'react';
import { render, screen, user, renderWithoutProviders, waitFor } from '../../../unitTestUtils';
import {
  BadResponseModalProvider,
  useBadResponseModal,
  BadResponseModal,
} from './BadResponseModal';
import { ToastAlertProvider } from '../../toast-alerts/ToastAlertProvider';
import { sendFeedback } from './sendFeedback';
import { AIStateProvider } from '../../../hooks/AIState';
import { stateManager } from '../../utils/aiStateManager';
import type { Message } from '../../../hooks/AIState';

// Mock the feedbackHooks module
jest.mock('./sendFeedback', () => ({
  ...jest.requireActual('./sendFeedback'),
  sendFeedback: jest.fn(),
}));

const mockSendFeedback = sendFeedback as jest.MockedFunction<typeof sendFeedback>;

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

  it('displays error alert when sendFeedback returns response with ok false', async () => {
    const errorResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: [
          {
            type: 'extra_forbidden',
            loc: ['body', 'foo'],
            msg: 'Extra inputs are not permitted',
            input: 'FOO',
          },
        ],
      }),
    } as unknown as Response;

    mockSendFeedback.mockResolvedValue(errorResponse);

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

    // Select a feedback type to enable submit button
    const incorrectRadio = screen.getByRole('radio', { name: /Incorrect/i });
    await user.click(incorrectRadio);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Send feedback' });
    await user.click(submitButton);

    // Wait for error alert to appear
    expect(await screen.findByText('Extra inputs are not permitted')).toBeInTheDocument();

    // Verify error alert has correct title
    expect(screen.getByText('Error submitting feedback')).toBeInTheDocument();

    // Modal should remain open on error
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays generic error message when error response has no detail', async () => {
    const errorResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Response;

    mockSendFeedback.mockResolvedValue(errorResponse);

    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Select feedback type and submit
    await user.click(screen.getByRole('radio', { name: /Incorrect/i }));
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Wait for generic error message
    expect(
      await screen.findByText('An error occurred while submitting feedback'),
    ).toBeInTheDocument();
  });

  it('displays error alert when sendFeedback throws an error', async () => {
    mockSendFeedback.mockRejectedValue(new Error('Network error'));

    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Select feedback type and submit
    await user.click(screen.getByRole('radio', { name: /Incorrect/i }));
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Wait for error message
    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('handles non-Error exceptions with generic error message', async () => {
    mockSendFeedback.mockRejectedValue('String error');

    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Select feedback type and submit
    await user.click(screen.getByRole('radio', { name: /Incorrect/i }));
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Wait for generic error message
    expect(await screen.findByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('clears error when modal is reopened', async () => {
    const errorResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: [{ msg: 'First error' }],
      }),
    } as unknown as Response;

    mockSendFeedback.mockResolvedValue(errorResponse);

    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Submit to trigger error
    await user.click(screen.getByRole('radio', { name: /Incorrect/i }));
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Verify error appears
    expect(await screen.findByText('First error')).toBeInTheDocument();

    // Close modal
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Reopen modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Error should be cleared
    expect(screen.queryByText('First error')).not.toBeInTheDocument();
  });

  it('clears error when form is resubmitted', async () => {
    // First submission fails
    const errorResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: [{ msg: 'First error' }],
      }),
    } as unknown as Response;

    mockSendFeedback.mockResolvedValueOnce(errorResponse);

    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // First submission
    await user.click(screen.getByRole('radio', { name: /Incorrect/i }));
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Verify error appears
    expect(await screen.findByText('First error')).toBeInTheDocument();

    // Second submission succeeds
    mockSendFeedback.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Response);

    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Error should be cleared immediately when resubmitting
    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });

  it('displays success alert and closes modal when submission succeeds', async () => {
    const successResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Response;

    mockSendFeedback.mockResolvedValue(successResponse);

    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // Submit form
    await user.click(screen.getByRole('radio', { name: /Incorrect/i }));
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    // Wait for success alert and modal close
    expect(await screen.findByText('Feedback submitted')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('does not show error alert when there is no error', async () => {
    renderWithAllProviders(
      <>
        <TestTrigger />
        <BadResponseModal />
      </>,
    );

    // Open modal
    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // No error alert should be visible
    expect(screen.queryByText('Error submitting feedback')).not.toBeInTheDocument();
  });
});
