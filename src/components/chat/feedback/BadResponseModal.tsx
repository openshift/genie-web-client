import type { ReactNode } from 'react';
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Form,
  FormContextProvider,
  ButtonVariant,
  AlertVariant,
} from '@patternfly/react-core';
import { OutlinedCommentAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import type { Message } from '../../../hooks/AIState';
import { useActiveConversation } from '../../../hooks/AIState';
import { getUserQuestionForBotMessage } from './utils';
import { useBadResponseFeedback } from './useBadResponseFeedback';
import { FeedbackAlert } from './FeedbackAlert';
import { FeedbackTypeRadioGroup } from './FeedbackTypeRadioGroup';
import { FeedbackDescriptionField } from './FeedbackDescriptionField';
import { FeedbackDisclaimer } from './FeedbackDisclaimer';

interface BadResponseModalData {
  userMessage?: Message;
  systemMessage?: Message;
  activeConversationId: string;
}

interface BadResponseModalContextType {
  isModalOpen: boolean;
  badResponseModalToggle: (message?: Message) => void;
  modalData: BadResponseModalData;
}

const BadResponseModalContext = createContext<BadResponseModalContextType | undefined>(undefined);

export const BadResponseModalProvider = ({ children }: { children: ReactNode }) => {
  const activeConversation = useActiveConversation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<BadResponseModalData>({
    userMessage: undefined,
    systemMessage: undefined,
    activeConversationId: '',
  });

  const badResponseModalToggle = useCallback(
    (message?: Message) => {
      if (!isModalOpen) {
        const conversationId = activeConversation?.id || '';
        const userMessage =
          message?.id && activeConversation?.messages
            ? getUserQuestionForBotMessage(activeConversation.messages, message.id)
            : undefined;

        setModalData({
          userMessage,
          systemMessage: message,
          activeConversationId: conversationId,
        });
      }
      setIsModalOpen(!isModalOpen);
    },
    [isModalOpen, activeConversation],
  );

  const contextValue = useMemo(
    () => ({
      isModalOpen,
      badResponseModalToggle,
      modalData,
    }),
    [isModalOpen, badResponseModalToggle, modalData],
  );

  return (
    <BadResponseModalContext.Provider value={contextValue}>
      {children}
    </BadResponseModalContext.Provider>
  );
};

export const useBadResponseModal = (): BadResponseModalContextType => {
  const context = useContext(BadResponseModalContext);
  if (context === undefined) {
    throw new Error('useBadResponseModal must be used within a BadResponseModalProvider');
  }
  return context;
};

interface BadResponseFormContentProps {
  setValue: (key: string, value: string) => void;
  values: Record<string, string>;
  badResponseModalToggle: () => void;
  modalData: BadResponseModalData;
}

const BadResponseFormContent = ({
  setValue,
  values,
  badResponseModalToggle,
  modalData,
}: BadResponseFormContentProps) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const errorAlertRef = useRef<HTMLDivElement>(null);
  const validationAlertRef = useRef<HTMLDivElement>(null);

  const {
    handleSubmit,
    isLoading,
    error,
    validationError,
    clearValidationError,
    isSubmitDisabled,
  } = useBadResponseFeedback({
    conversationId: modalData.activeConversationId,
    userQuestion: modalData.userMessage?.answer || '',
    llmResponse: modalData.systemMessage?.answer || '',
    feedbackType: values['feedback-type'],
    userFeedback: values['user_feedback'],
    systemMessageId: modalData.systemMessage?.id,
    onSuccess: badResponseModalToggle,
  });

  useEffect(() => {
    if (error && errorAlertRef.current) {
      // Use setTimeout to ensure the alert is rendered before focusing
      setTimeout(() => {
        errorAlertRef.current?.focus();
      }, 0);
    }
  }, [error]);

  useEffect(() => {
    if (validationError && validationAlertRef.current) {
      // Use setTimeout to ensure the alert is rendered before focusing
      setTimeout(() => {
        validationAlertRef.current?.focus();
      }, 0);
    }
  }, [validationError]);

  const handleFeedbackTypeChange = useCallback(
    (value: string) => {
      setValue('feedback-type', value);
      clearValidationError();
    },
    [setValue, clearValidationError],
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setValue('user_feedback', value);
    },
    [setValue],
  );

  return (
    <>
      <ModalBody>
        {error ? (
          <FeedbackAlert
            ref={errorAlertRef}
            variant={AlertVariant.danger}
            title={t('feedback.badResponse.error.title')}
          >
            {error}
          </FeedbackAlert>
        ) : null}

        {validationError ? (
          <FeedbackAlert
            ref={validationAlertRef}
            variant={AlertVariant.danger}
            title={t('feedback.badResponse.error.validation')}
          />
        ) : null}

        <Form>
          <FeedbackTypeRadioGroup
            selectedValue={values['feedback-type']}
            onValueChange={handleFeedbackTypeChange}
            isDisabled={isLoading}
          />

          <FeedbackDescriptionField
            value={values['user_feedback'] || ''}
            onValueChange={handleDescriptionChange}
            isDisabled={isSubmitDisabled}
            isReadOnly={isLoading}
          />

          <FeedbackDisclaimer />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant={ButtonVariant.primary}
          onClick={handleSubmit}
          isLoading={isLoading}
          spinnerAriaValueText={t('feedback.badResponse.button.submitting')}
        >
          {t('feedback.badResponse.button.submit')}
        </Button>
        <Button key="cancel" variant={ButtonVariant.link} onClick={badResponseModalToggle}>
          {t('feedback.badResponse.button.cancel')}
        </Button>
      </ModalFooter>
    </>
  );
};

export const BadResponseModal = () => {
  const { t } = useTranslation('plugin__genie-web-client');
  const { isModalOpen, badResponseModalToggle, modalData } = useBadResponseModal();

  const handleClose = useCallback(() => {
    badResponseModalToggle();
  }, [badResponseModalToggle]);

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      ouiaId="BadResponseModal"
      aria-labelledby="bad-response-modal-title"
      variant={ModalVariant.medium}
    >
      <ModalHeader
        title={t('feedback.badResponse.modal.title')}
        labelId="bad-response-modal-title"
        titleIconVariant={OutlinedCommentAltIcon}
      />
      <FormContextProvider initialValues={{ 'feedback-type': '' }}>
        {({ setValue, values }) => (
          <BadResponseFormContent
            setValue={setValue}
            values={values}
            badResponseModalToggle={handleClose}
            modalData={modalData}
          />
        )}
      </FormContextProvider>
    </Modal>
  );
};
