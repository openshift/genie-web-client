import { ReactNode } from 'react';
import { Modal, ModalHeader, ModalBody, ModalVariant } from '@patternfly/react-core';
import './LegalModal.css';
import { ClipboardCheckIcon } from '@patternfly/react-icons';

type LegalModalProps = {
  isOpen: boolean;
  titleKey: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function LegalModal(props: LegalModalProps) {
  const { isOpen, titleKey, title, subtitle, onClose, children } = props;

  return (
    <Modal
      className="legal-modal"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      aria-labelledby="legal-modal"
    >
      <ModalHeader title={titleKey} titleIconVariant={ClipboardCheckIcon} labelId="legal-modal-header" />
      <ModalBody tabIndex={0}>
        {title ? <div className="legal-modal__title">{title}</div> : null}
        {subtitle ? <div className="legal-modal__subtitle">{subtitle}</div> : null}
        <div className="legal-modal__body">{children}</div>
      </ModalBody>
    </Modal>
  );
}


