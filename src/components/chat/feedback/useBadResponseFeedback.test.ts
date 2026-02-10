import { renderHook, waitFor } from '../../../unitTestUtils';
import { useBadResponseFeedback } from './useBadResponseFeedback';
import { useSendFeedback } from '../../../hooks/AIState/feedbackHooks';
import { useToastAlerts } from '../../toast-alerts/ToastAlertProvider';
import { AlertVariant } from '@patternfly/react-core';

// Mock dependencies
jest.mock('../../../hooks/AIState/feedbackHooks');
jest.mock('../../toast-alerts/ToastAlertProvider');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSendFeedback = jest.fn();
const mockAddAlert = jest.fn();
const mockOnSuccess = jest.fn();

const mockUseSendFeedback = useSendFeedback as jest.MockedFunction<typeof useSendFeedback>;
const mockUseToastAlerts = useToastAlerts as jest.MockedFunction<typeof useToastAlerts>;

describe('useBadResponseFeedback', () => {
  const defaultParams = {
    conversationId: 'conv-123',
    userQuestion: 'What is React?',
    llmResponse: 'React is a library',
    feedbackType: 'incorrect',
    userFeedback: 'This is wrong',
    systemMessageId: 'msg-456',
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: null,
      success: false,
    });

    mockUseToastAlerts.mockReturnValue({
      alerts: [],
      addAlert: mockAddAlert,
      removeAlert: jest.fn(),
    });

    jest.clearAllMocks();
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useBadResponseFeedback(defaultParams));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.validationError).toBe(false);
    expect(result.current.isSubmitDisabled).toBe(false);
  });

  it('calculates isSubmitDisabled correctly when feedbackType is missing', () => {
    const params = { ...defaultParams, feedbackType: undefined };
    const { result } = renderHook(() => useBadResponseFeedback(params));

    expect(result.current.isSubmitDisabled).toBe(true);
  });

  it('calculates isSubmitDisabled correctly when isLoading is true', () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: true,
      error: null,
      success: false,
    });

    const { result } = renderHook(() => useBadResponseFeedback(defaultParams));

    expect(result.current.isSubmitDisabled).toBe(true);
  });

  it('sets validation error when submitting without feedback type', async () => {
    const params = { ...defaultParams, feedbackType: undefined };
    const { result } = renderHook(() => useBadResponseFeedback(params));

    await result.current.handleSubmit();

    expect(result.current.validationError).toBe(true);
    expect(mockSendFeedback).not.toHaveBeenCalled();
  });

  it('calls sendFeedback with correct parameters', async () => {
    const { result } = renderHook(() => useBadResponseFeedback(defaultParams));

    await result.current.handleSubmit();

    expect(mockSendFeedback).toHaveBeenCalledWith({
      conversation_id: 'conv-123',
      user_question: 'What is React?',
      llm_response: 'React is a library',
      categories: ['incorrect'],
      user_feedback: 'This is wrong',
      sentiment: -1,
    });
  });

  it('calls sendFeedback with empty user_feedback when not provided', async () => {
    const params = { ...defaultParams, userFeedback: undefined };
    const { result } = renderHook(() => useBadResponseFeedback(params));

    await result.current.handleSubmit();

    expect(mockSendFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        user_feedback: '',
      }),
    );
  });

  it('clears validation error when clearValidationError is called', async () => {
    const params = { ...defaultParams, feedbackType: undefined };
    const { result } = renderHook(() => useBadResponseFeedback(params));

    // Trigger validation error
    await result.current.handleSubmit();
    expect(result.current.validationError).toBe(true);

    // Clear validation error
    result.current.clearValidationError();

    await waitFor(() => {
      expect(result.current.validationError).toBe(false);
    });
  });

  it('displays success alert and calls onSuccess when submission succeeds', async () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: null,
      success: true,
    });

    renderHook(() => useBadResponseFeedback(defaultParams));

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith({
        id: expect.stringContaining('feedback-alert-'),
        title: 'feedback.badResponse.success.title',
        variant: AlertVariant.success,
        children: 'feedback.badResponse.success.description.',
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('includes systemMessageId in alert ID when provided', async () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: null,
      success: true,
    });

    renderHook(() => useBadResponseFeedback(defaultParams));

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringContaining('msg-456'),
        }),
      );
    });
  });

  it('returns error from useSendFeedback', () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: false,
      error: 'Network error',
      success: false,
    });

    const { result } = renderHook(() => useBadResponseFeedback(defaultParams));

    expect(result.current.error).toBe('Network error');
  });

  it('returns isLoading state from useSendFeedback', () => {
    mockUseSendFeedback.mockReturnValue({
      sendFeedback: mockSendFeedback,
      isLoading: true,
      error: null,
      success: false,
    });

    const { result } = renderHook(() => useBadResponseFeedback(defaultParams));

    expect(result.current.isLoading).toBe(true);
  });
});
