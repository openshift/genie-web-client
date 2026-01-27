import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { stateManager } from '../../components/utils/aiStateManager';
import type { FeedbackRequest } from './types';

export { FeedbackCategory } from '@redhat-cloud-services/lightspeed-client';

type WithIsPositive = FeedbackRequest & { isPositive: boolean; sentiment?: -1 | 1 | null };
type WithSentiment = FeedbackRequest & { isPositive?: boolean; sentiment: -1 | 1 };

export type Feedback = WithIsPositive | WithSentiment;

// Helper function to extract error message from API response
const extractErrorMessage = (errorData: unknown, defaultMessage: string): string => {
  if (typeof errorData === 'object' && errorData !== null && 'detail' in errorData) {
    const detail = (errorData as { detail?: unknown[] }).detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0];
      if (typeof firstError === 'object' && firstError !== null && 'msg' in firstError) {
        return String((firstError as { msg: unknown }).msg);
      }
    }
  }
  return defaultMessage;
};

export const useSendFeedback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation('plugin__genie-web-client');
  const sendFeedback = async (feedback: Feedback) => {
    const feedbackRequest: FeedbackRequest = {
      conversation_id: feedback.conversation_id,
      user_question: feedback.user_question,
      llm_response: feedback.llm_response,
      user_feedback: feedback.user_feedback,
      categories: feedback.categories,
      sentiment: feedback.isPositive || feedback.sentiment === 1 ? 1 : -1,
    };

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const client = stateManager.getClient();
      await client.storeFeedback(feedbackRequest);

      setSuccess(true);
    } catch (error) {
      setError(extractErrorMessage(error, t('feedback.badResponse.error.unexpected')));
    } finally {
      setIsLoading(false);
    }
  };
  return { sendFeedback, isLoading, error, success };
};
