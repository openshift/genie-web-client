import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom-v5-compat';
import type { GenieOutletContext } from '../../types/types';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Button,
} from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';

const Home = () => {
  const { t } = useTranslation('plugin__genie-web-client');

  const outlet = useOutletContext<GenieOutletContext | undefined>();
  const userName = outlet?.userName || '';

  const titleText = userName
    ? t('dashboard.emptyState.heading', { name: userName })
    : t('dashboard.emptyState.headingNoName');

  return (
    <EmptyState className="global-layout-empty-state" variant="xl" titleText={titleText}>
      <EmptyStateBody className="pf-v6-u-font-size-lg">
        {t('dashboard.emptyState.description')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button icon={<PlusIcon />} onClick={() => console.log('go to create dashboard')}>
            {t('dashboard.emptyState.cta')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default Home;
