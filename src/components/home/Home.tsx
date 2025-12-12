import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { mainGenieRoute, SubRoutes } from '../routeList';
import { useSendMessage } from '@redhat-cloud-services/ai-react-state';
import { useNavigate } from 'react-router-dom-v5-compat';

export const Home: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const { t } = useTranslation('plugin__genie-web-client');
  const sendMessage = useSendMessage();
  const navigate = useNavigate();

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
          <Button
            icon={<PlusIcon />}
            onClick={() => {
              sendMessage('Can you help me create a new dashboard?', {
                stream: true,
                requestOptions: {},
              });
              navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
            }}
          >
            {t('dashboard.emptyState.cta')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
