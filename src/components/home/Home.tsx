import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const [userName, setUserName] = useState<string>('');
  useEffect(() => {
    try {
      const storedName = localStorage.getItem('genieUserName');
      if (storedName && typeof storedName === 'string') {
        setUserName(storedName);
      }
    } catch {
      // local storage not available
    }
  }, []);

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
