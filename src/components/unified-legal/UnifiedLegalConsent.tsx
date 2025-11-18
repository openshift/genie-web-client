import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LegalModal } from '../legal-modal/LegalModal';
import termsOfUse from '../../content/termsOfUse';
import { Button } from '@patternfly/react-core';

export function UnifiedLegalConsent() {
  const { t } = useTranslation();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div>
      <Button variant="link" isInline onClick={() => setIsTermsOpen(true)}>
        {t('plugin__genie-web-client~termsService')}
      </Button>
      <LegalModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        titleKey={t('plugin__genie-web-client~termsService')}
        title={t('plugin__genie-web-client~rhTerms')}
        subtitle={t('plugin__genie-web-client~lastUpdated', { date: 'March 20, 2023' })}
      >
        {termsOfUse}
      </LegalModal>
      </div>
  );
}



