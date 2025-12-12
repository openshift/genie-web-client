import React, { useEffect, useState } from 'react';
import './NewChat.css';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Button,
} from '@patternfly/react-core';
import {
  RhStandardBarGraphIcon,
  RhStandardBugIcon,
  RhStandardCommandLineIcon,
  RhUiAiExperienceIcon,
  RhUiAnalyzeIcon,
} from '@patternfly/react-icons';
import { MessageBar } from '@patternfly/chatbot';
import { mainGenieRoute, SubRoutes } from '../routeList';
import { useSendMessage } from '@redhat-cloud-services/ai-react-state';
import { useNavigate } from 'react-router-dom-v5-compat';

export const NewChat = () => {
  const { t } = useTranslation('plugin__genie-web-client');
  const [userName, setUserName] = useState<string>('');
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
    ? t('newChat.heading', { name: userName })
    : t('newChat.headingNoName');

  const suggestions: Array<{
    key: 'build' | 'automate' | 'troubleshoot' | 'analyze' | 'explore';
    icon?: React.ReactNode;
  }> = [
    { key: 'build', icon: <RhStandardBarGraphIcon /> },
    { key: 'automate', icon: <RhStandardCommandLineIcon /> },
    { key: 'troubleshoot', icon: <RhStandardBugIcon /> },
    { key: 'analyze', icon: <RhUiAnalyzeIcon /> },
    { key: 'explore', icon: <RhUiAiExperienceIcon /> },
  ];

  return (
    <EmptyState className="new-chat" variant="xl" titleText={titleText}>
      <EmptyStateBody className="pf-v6-u-font-size-lg">{t('newChat.description')}</EmptyStateBody>
      <MessageBar
        aria-label={t('newChat.promptPlaceholder') as string}
        placeholder={t('newChat.promptPlaceholder') as string}
        onSendMessage={(message: string | number) => {
          sendMessage(message, { stream: true, requestOptions: {} });
          navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
        }}
      />
      <EmptyStateFooter>
        <EmptyStateActions>
          {suggestions.slice(0, 3).map(({ key, icon }) => (
            <Button key={key} variant="tertiary" icon={icon}>
              {t(`newChat.suggestion.${key}`)}
            </Button>
          ))}
        </EmptyStateActions>
        <EmptyStateActions>
          {suggestions.slice(3).map(({ key, icon }) => (
            <Button key={key} variant="tertiary" icon={icon}>
              {t(`newChat.suggestion.${key}`)}
            </Button>
          ))}
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};