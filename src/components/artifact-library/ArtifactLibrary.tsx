import { useState, useEffect, useRef } from 'react';
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
import { RhUiCollectionIcon, RhUiAiExperienceIcon, RhUiRefreshIcon } from '@patternfly/react-icons';
import ErrorState from '@patternfly/react-component-groups/dist/dynamic/ErrorState';
import { useTranslation } from 'react-i18next';
import './ArtifactLibrary.css';

export type Artifact = { id: string };
export const artifactApi = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async fetchArtifacts(): Promise<Artifact[]> {
    return [];
  },
};

export const ArtifactLibrary = () => {
  const { t } = useTranslation('plugin__genie-web-client');

  // Temporary fetch wiring; will be replaced when API is finalized
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const retryRef = useRef<HTMLButtonElement>(null);

  const refreshArtifacts = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await artifactApi.fetchArtifacts();
      setArtifacts(result || []);
      setIsError(false);
    } catch (error) {
      console.error('Failed to fetch artifacts:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshArtifacts();
  }, []);

  useEffect(() => {
    if (isError) {
      retryRef.current?.focus();
    }
  }, [isError]);

  // error state
  if (!isLoading && isError) {
    return (
      <Bullseye>
        <div className="artifact-library-error" role="alert">
          <ErrorState
            titleText={t('artifactLibrary.error.heading')}
            bodyText={t('artifactLibrary.error.description')}
            customFooter={
              <Button
                ref={retryRef}
                autoFocus
                variant="primary"
                icon={<RhUiRefreshIcon />}
                onClick={() => void refreshArtifacts()}
              >
                {t('artifactLibrary.error.retry')}
              </Button>
            }
          />
        </div>
      </Bullseye>
    );
  }

  // empty state - no artifacts saved yet
  if (!isLoading && artifacts.length === 0) {
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.lg}>
          {/* TODO: Add branded thumbnail graphic/icon above text when provided by design team */}
          <div className="pf-v6-u-mb-md">
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
              <Button
                variant="primary"
                icon={<RhUiAiExperienceIcon />}
                onClick={() => console.log('Create dashboard clicked')}
              >
                {t('artifactLibrary.emptyState.primaryCta')}
              </Button>
              <Button
                variant="secondary"
                icon={<RhUiAiExperienceIcon />}
                onClick={() => console.log('Code config file clicked')}
              >
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
