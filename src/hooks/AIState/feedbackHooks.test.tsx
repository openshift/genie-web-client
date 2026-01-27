import { renderHook, waitFor, act } from '../../unitTestUtils';
import { useSendFeedback, FeedbackCategory } from './feedbackHooks';
import { stateManager } from '../../components/utils/aiStateManager';
import { LightspeedClient } from '@redhat-cloud-services/lightspeed-client';

// Mock the stateManager
jest.mock('../../components/utils/aiStateManager', () => ({
  stateManager: {
    getClient: jest.fn(),
  },
}));

const mockGetClient = stateManager.getClient as jest.MockedFunction<typeof stateManager.getClient>;

describe('useSendFeedback', () => {
  const mockStoreFeedback = jest.fn();

  beforeEach(() => {
    mockGetClient.mockReturnValue({
      storeFeedback: mockStoreFeedback,
    } as unknown as LightspeedClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state with isLoading false, error null, and success false', () => {
    const { result } = renderHook(() => useSendFeedback());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(typeof result.current.sendFeedback).toBe('function');
  });

  it('sets isLoading to true during feedback submission', async () => {
    mockStoreFeedback.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'This response was incorrect.',
      categories: [FeedbackCategory.INCORRECT],
      isPositive: false,
    };

    let sendPromise: Promise<void>;
    act(() => {
      sendPromise = result.current.sendFeedback(feedback);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      await sendPromise;
    });
  });

  it('calls storeFeedback with correct data when isPositive is true', async () => {
    mockStoreFeedback.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Great response!',
      categories: [],
      isPositive: true,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockStoreFeedback).toHaveBeenCalledWith({
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Great response!',
      categories: [],
      sentiment: 1,
    });
  });

  it('calls storeFeedback with correct data when isPositive is false', async () => {
    mockStoreFeedback.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'This response was incorrect.',
      categories: [FeedbackCategory.INCORRECT],
      isPositive: false,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockStoreFeedback).toHaveBeenCalledWith({
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'This response was incorrect.',
      categories: [FeedbackCategory.INCORRECT],
      sentiment: -1,
    });
  });

  it('calls storeFeedback with correct data when sentiment is 1', async () => {
    mockStoreFeedback.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-456',
      user_question: 'How do I deploy?',
      llm_response: 'Use kubectl apply.',
      user_feedback: 'Perfect!',
      categories: [],
      sentiment: 1 as const,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockStoreFeedback).toHaveBeenCalledWith({
      conversation_id: 'conv-456',
      user_question: 'How do I deploy?',
      llm_response: 'Use kubectl apply.',
      user_feedback: 'Perfect!',
      categories: [],
      sentiment: 1,
    });
  });

  it('calls storeFeedback with correct data when sentiment is -1', async () => {
    mockStoreFeedback.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-789',
      user_question: 'What is Kubernetes?',
      llm_response: 'It is a container orchestration platform.',
      user_feedback: 'Too vague.',
      categories: [FeedbackCategory.INCOMPLETE],
      sentiment: -1 as const,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockStoreFeedback).toHaveBeenCalledWith({
      conversation_id: 'conv-789',
      user_question: 'What is Kubernetes?',
      llm_response: 'It is a container orchestration platform.',
      user_feedback: 'Too vague.',
      categories: [FeedbackCategory.INCOMPLETE],
      sentiment: -1,
    });
  });

  it('sets success to true and isLoading to false when feedback submission succeeds', async () => {
    mockStoreFeedback.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Great!',
      categories: [],
      isPositive: true,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error message from API response detail array when submission fails', async () => {
    const errorResponse = {
      detail: [
        {
          msg: 'Invalid conversation ID',
          type: 'value_error',
        },
      ],
    };
    mockStoreFeedback.mockRejectedValue(errorResponse);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'invalid-id',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Good response.',
      categories: [],
      isPositive: true,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.error).toBe('Invalid conversation ID');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('sets default error message when API response has no detail array', async () => {
    const errorResponse = {
      message: 'Something went wrong',
    };
    mockStoreFeedback.mockRejectedValue(errorResponse);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Good response.',
      categories: [],
      isPositive: true,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.error).toBe('An unexpected error occurred');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('sets default error message when API response detail array is empty', async () => {
    const errorResponse = {
      detail: [],
    };
    mockStoreFeedback.mockRejectedValue(errorResponse);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Good response.',
      categories: [],
      isPositive: true,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.error).toBe('An unexpected error occurred');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('sets default error message when error is a string', async () => {
    mockStoreFeedback.mockRejectedValue('Network error');

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Good response.',
      categories: [],
      isPositive: true,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.error).toBe('An unexpected error occurred');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('resets error and success state when new feedback is submitted', async () => {
    mockStoreFeedback.mockRejectedValueOnce({ detail: [{ msg: 'First error' }] });

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Good response.',
      categories: [],
      isPositive: true,
    };

    // First submission with error
    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.error).toBe('First error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);

    // Second submission should reset error
    mockStoreFeedback.mockResolvedValue(undefined);
    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(true);
  });

  it('handles all feedback categories correctly', async () => {
    mockStoreFeedback.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Response has multiple issues.',
      categories: [
        FeedbackCategory.INCORRECT,
        FeedbackCategory.INCOMPLETE,
        FeedbackCategory.UNSAFE,
        FeedbackCategory.NOT_RELEVANT,
      ],
      isPositive: false,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockStoreFeedback).toHaveBeenCalledWith({
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Response has multiple issues.',
      categories: [
        FeedbackCategory.INCORRECT,
        FeedbackCategory.INCOMPLETE,
        FeedbackCategory.UNSAFE,
        FeedbackCategory.NOT_RELEVANT,
      ],
      sentiment: -1,
    });
  });

  it('calls getClient from stateManager', async () => {
    mockStoreFeedback.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSendFeedback());

    const feedback = {
      conversation_id: 'conv-123',
      user_question: 'What is the weather?',
      llm_response: 'The weather is sunny.',
      user_feedback: 'Good!',
      categories: [],
      isPositive: true,
    };

    await act(async () => {
      await result.current.sendFeedback(feedback);
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockGetClient).toHaveBeenCalled();
  });
});
