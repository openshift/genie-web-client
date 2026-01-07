import * as React from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Button,
  Label,
} from '@patternfly/react-core';
import { RhUiCollectionIcon, RhUiAiExperienceIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export const ArtifactLibrary: React.FC = () => {
  const { t } = useTranslation('plugin__genie-web-client');

  // TODO: replace with actual artifact fetching logic when API is available
  const artifacts: never[] = [];
  const isLoading = false;

  // empty state - no artifacts saved yet
  if (!isLoading && artifacts.length === 0) {
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.lg}>
          {/* TODO: Add branded thumbnail graphic/icon above text when provided by design team */}
          <div style={{ marginBottom: 'var(--pf-v6-global--spacer--md)' }}>
            <Label icon={<RhUiCollectionIcon />}>{t('artifactLibrary.ariaLabel')}</Label>
          </div>
          <h1 className="pf-v6-u-font-size-2xl pf-v6-u-mb-md">
            {t('artifactLibrary.emptyState.heading')}
          </h1>
          <EmptyStateBody className="pf-v6-u-font-size-md">
            {t('artifactLibrary.emptyState.description')}
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button variant="primary" icon={<RhUiAiExperienceIcon />} onClick={() => console.log('Create dashboard clicked')}>
                {t('artifactLibrary.emptyState.primaryCta')}
              </Button>
              <Button variant="secondary" icon={<RhUiAiExperienceIcon />} onClick={() => console.log('Code config file clicked')}>
                {t('artifactLibrary.emptyState.secondaryCta')}
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </Bullseye>
    );
  }

  // TODO: implement populated state with grid/list view
  return (
    <div>
      <h1>Artifact Library</h1>
      <p>Populated state coming soon...</p>
    </div>
  );
};

