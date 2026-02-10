import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { FeedbackCategoryType } from '../../../hooks/AIState';
import { useSendFeedback } from '../../../hooks/AIState';
import { useToastAlerts } from '../../toast-alerts/ToastAlertProvider';
import { AlertVariant } from '@patternfly/react-core';

interface UseBadResponseFeedbackParams {
  conversationId: string;
  userQuestion: string;
  llmResponse: string;
  feedbackType?: string;
  userFeedback?: string;
  systemMessageId?: string;
  onSuccess: () => void;
}

interface UseBadResponseFeedbackReturn {
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  validationError: boolean;
  clearValidationError: () => void;
  isSubmitDisabled: boolean;
}

const generateAlertId = (messageId?: string): string => {
  return `feedback-alert-${Date.now()}-${messageId || 'unknown'}`;
};

export const useBadResponseFeedback = ({
  conversationId,
  userQuestion,
  llmResponse,
  feedbackType,
  userFeedback,
  systemMessageId,
  onSuccess,
}: UseBadResponseFeedbackParams): UseBadResponseFeedbackReturn => {
  const { t } = useTranslation('plugin__genie-web-client');
  const { addAlert } = useToastAlerts();
  const { isLoading, error, success, sendFeedback } = useSendFeedback();
  const [validationError, setValidationError] = useState(false);

  const isSubmitDisabled = !feedbackType || isLoading;

  const handleSubmit = useCallback(async () => {
    if (isSubmitDisabled) {
      setValidationError(true);

      return;
    }

    await sendFeedback({
      conversation_id: conversationId,
      user_question: userQuestion,
      llm_response: llmResponse,
      categories: [feedbackType as FeedbackCategoryType],
      user_feedback: userFeedback || '',
      sentiment: -1,
    });
  }, [
    isSubmitDisabled,
    sendFeedback,
    conversationId,
    userQuestion,
    llmResponse,
    feedbackType,
    userFeedback,
  ]);

  useEffect(() => {
    if (success) {
      addAlert({
        id: generateAlertId(systemMessageId),
        title: t('feedback.badResponse.success.title'),
        variant: AlertVariant.success,
        children: `${t('feedback.badResponse.success.description')}.`,
      });
      onSuccess();
    }
  }, [success, addAlert, systemMessageId, onSuccess]);

  const clearValidationError = useCallback(() => {
    setValidationError(false);
  }, []);

  return {
    handleSubmit,
    isLoading,
    error,
    validationError,
    clearValidationError,
    isSubmitDisabled,
  };
};
