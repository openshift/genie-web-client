import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import './DeleteConversationModal.css';

export type DeleteConversationModalProps = {
  conversation: { id: string; title: string };
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  error: string | null;
};

export function DeleteConversationModal({
  conversation,
  onClose,
  onConfirm,
  isDeleting,
  error,
}: DeleteConversationModalProps) {
  const { t } = useTranslation('plugin__genie-web-client');
  return (
    <Modal
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      aria-labelledby="delete-conversation-modal"
      backdropClassName="genie-delete-conversation-modal-backdrop"
    >
      <ModalHeader
        title={t('chat.deleteModal.title', { title: conversation.title })}
        titleIconVariant={TrashIcon}
        labelId="delete-conversation-modal"
      />
      <ModalBody>
        {error && (
          <Alert variant={AlertVariant.danger} isInline className="pf-v6-u-mb-md" title={error} />
        )}
        {t('chat.deleteModal.body')}
      </ModalBody>
      <ModalFooter className="pf-v6-u-display-flex pf-v6-u-justify-content-flex-end">
        <Button variant={ButtonVariant.link} onClick={onClose}>
          {t('chat.deleteModal.cancel')}
        </Button>
        <Button
          variant={ButtonVariant.danger}
          onClick={onConfirm}
          isDisabled={isDeleting}
          icon={isDeleting ? <Spinner size="sm" /> : undefined}
        >
          {t('chat.deleteModal.confirm')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
