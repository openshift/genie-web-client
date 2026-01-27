import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Radio,
  Form,
  FormContextProvider,
  TextArea,
  ButtonVariant,
  AlertVariant,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { RhUiInformationIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import type { Message } from '../../../hooks/AIState';
import { useActiveConversation } from '../../../hooks/AIState';
import type { FeedbackCategoryType } from '../../../hooks/AIState';
import { FeedbackCategory } from '../../../hooks/AIState/';
import { useSendFeedback } from '../../../hooks/AIState';
import { getUserQuestionForBotMessage } from './utils';
import { useToastAlerts } from '../../toast-alerts/ToastAlertProvider';

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

const FEEDBACK_TYPES = [
  {
    labelKey: 'feedback.badResponse.type.incorrect.label',
    descriptionKey: 'feedback.badResponse.type.incorrect.description',
    value: FeedbackCategory.INCORRECT,
  },
  {
    labelKey: 'feedback.badResponse.type.unhelpful.label',
    descriptionKey: 'feedback.badResponse.type.unhelpful.description',
    value: FeedbackCategory.NOT_RELEVANT,
  },
  {
    labelKey: 'feedback.badResponse.type.incomplete.label',
    descriptionKey: 'feedback.badResponse.type.incomplete.description',
    value: FeedbackCategory.INCOMPLETE,
  },
  {
    labelKey: 'feedback.badResponse.type.harmful.label',
    descriptionKey: 'feedback.badResponse.type.harmful.description',
    value: FeedbackCategory.UNSAFE,
  },
  {
    labelKey: 'feedback.badResponse.type.other.label',
    descriptionKey: undefined,
    value: FeedbackCategory.OTHER,
  },
] as const;

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

// Helper function to generate unique alert ID
const generateAlertId = (messageId?: string): string => {
  return `feedback-alert-${Date.now()}-${messageId || 'unknown'}`;
};

interface BadResponseFormContentProps {
  setValue: (key: string, value: string) => void;
  values: Record<string, string>;
  badResponseModalToggle: () => void;
  modalData: BadResponseModalData;
  isModalOpen: boolean;
}

const BadResponseFormContent = ({
  setValue,
  values,
  badResponseModalToggle,
  modalData,
  isModalOpen,
}: BadResponseFormContentProps) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const { addAlert } = useToastAlerts();
  const { isLoading, error, success, sendFeedback } = useSendFeedback();

  const handleSubmit = useCallback(async () => {
    await sendFeedback({
      conversation_id: modalData.activeConversationId,
      user_question: modalData.userMessage?.answer || '',
      llm_response: modalData.systemMessage?.answer || '',
      categories: [values['feedback-type'] as FeedbackCategoryType],
      user_feedback: values['user_feedback'] || '',
      sentiment: -1,
    });
  }, [modalData, values, sendFeedback]);

  useEffect(() => {
    if (success && isModalOpen) {
      addAlert({
        id: generateAlertId(modalData.systemMessage?.id),
        title: t('feedback.badResponse.success.title'),
        variant: AlertVariant.success,
      });
      badResponseModalToggle();
    }
  }, [success, addAlert, modalData.systemMessage?.id, t, badResponseModalToggle]);

  const isSubmitDisabled = !values['feedback-type'] || isLoading;

  return (
    <>
      <ModalBody>
        {error ? (
          <Alert
            variant="danger"
            isInline
            title={t('feedback.badResponse.error.title')}
            className="pf-v6-u-mb-lg"
            role="alert"
          >
            {error}
          </Alert>
        ) : null}

        <Form>
          <FormGroup
            role="radiogroup"
            isStack
            fieldId="feedback-type-group"
            label={t('feedback.badResponse.form.label')}
            isRequired
          >
            {FEEDBACK_TYPES.map((feedback) => (
              <Radio
                key={feedback.value}
                name="feedback-type"
                label={t(feedback.labelKey)}
                id={`feedback-type-${feedback.value}`}
                isChecked={values['feedback-type'] === feedback.value}
                onChange={() => setValue('feedback-type', feedback.value)}
                description={feedback.descriptionKey ? t(feedback.descriptionKey) : undefined}
                isDisabled={isLoading}
              />
            ))}
          </FormGroup>
          <FormGroup
            label={t('feedback.badResponse.form.description.label')}
            type="string"
            fieldId="user_feedback"
          >
            <TextArea
              resizeOrientation="vertical"
              value={values['user_feedback'] || ''}
              onChange={(_event, value) => setValue('user_feedback', value)}
              placeholder={t('feedback.badResponse.form.description.placeholder')}
              isDisabled={isSubmitDisabled}
              maxLength={2500}
              readOnly={isLoading}
            />
          </FormGroup>

          <Split hasGutter>
            <SplitItem>
              <RhUiInformationIcon />
            </SplitItem>
            <SplitItem isFilled>
              <Content component={ContentVariants.small}>
                {t('feedback.badResponse.form.disclaimer')}
              </Content>
            </SplitItem>
          </Split>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant={ButtonVariant.primary}
          onClick={handleSubmit}
          isDisabled={isSubmitDisabled}
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
      />
      <FormContextProvider initialValues={{ 'feedback-type': '' }}>
        {({ setValue, values }) => (
          <BadResponseFormContent
            setValue={setValue}
            values={values}
            badResponseModalToggle={handleClose}
            modalData={modalData}
            isModalOpen={isModalOpen}
          />
        )}
      </FormContextProvider>
    </Modal>
  );
};
