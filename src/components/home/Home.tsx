import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { RhUiAiExperienceIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { useSendStreamMessage } from '../../hooks/AIState';
import { useNavigate } from 'react-router-dom-v5-compat';
import { mainGenieRoute, SubRoutes } from '../routeList';

export const Home: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const { t } = useTranslation('plugin__genie-web-client');
  const sendStreamMessage = useSendStreamMessage();
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

  const handleCreateDashboardClick = useCallback(() => {
    sendStreamMessage('Can you help me create a new dashboard?');
    navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
  }, [sendStreamMessage, navigate]);

  return (
    <EmptyState className="global-layout-empty-state" variant="xl" titleText={titleText}>
      <EmptyStateBody className="pf-v6-u-font-size-lg">
        {t('dashboard.emptyState.description')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button size="lg" icon={<RhUiAiExperienceIcon />} onClick={handleCreateDashboardClick}>
            {t('dashboard.emptyState.cta')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
