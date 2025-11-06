import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Content, PageSection } from '@patternfly/react-core';
import './example.css';

export default function GeniePage() {
  const { t } = useTranslation('plugin__genie-web-client');

  return (
    <>
      <PageSection>
      </PageSection>
      <PageSection>
        <Content component="p">
          <span className="genie-web-client__nice">
            {t('genie')}
            testing
          </span>
        </Content>
      </PageSection>
    </>
  );
}
