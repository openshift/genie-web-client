import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { MessageBar } from '@patternfly/chatbot';
import {
  RhStandardBarGraphIcon,
  RhStandardBugIcon,
  RhStandardCommandLineIcon,
  RhUiAiExperienceIcon,
  RhUiAnalyzeIcon,
} from '@patternfly/react-icons';
import { useCallback, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSendStreamMessage } from '../../hooks/AIState';
import { useNavigate } from 'react-router-dom-v5-compat';
import { buildQuickResponsesPayload, getIntroPromptKey } from './suggestions';
import { useChatBar } from '../ChatBarContext';
import { mainGenieRoute, SubRoutes } from '../routeList';
import './NewChat.css';

export const NewChat: React.FC = () => {
  const { setShowChatBar } = useChatBar();
  const { t } = useTranslation('plugin__genie-web-client');
  const [userName, setUserName] = useState<string>('');
  const sendStreamMessage = useSendStreamMessage();
  const navigate = useNavigate();

  useEffect(() => {
    setShowChatBar(false);
  }, [setShowChatBar]);

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

  const handleSendMessage = useCallback(
    (message: string | number) => {
      sendStreamMessage(message);
      navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
    },
    [sendStreamMessage, navigate],
  );

  const suggestions: Array<{
    key: 'build' | 'automate' | 'troubleshoot' | 'analyze' | 'explore';
    icon?: ReactNode;
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
        onSendMessage={handleSendMessage}
      />
      <EmptyStateFooter>
        <EmptyStateActions>
          {suggestions.slice(0, 3).map(({ key, icon }) => (
            <Button
              key={key}
              variant="tertiary"
              icon={icon}
              onClick={() => {
                const prompt = t(getIntroPromptKey(key));
                sendStreamMessage(prompt, {
                  requestPayload: { quickResponses: buildQuickResponsesPayload(key) },
                });
                navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
              }}
            >
              {t(`newChat.suggestion.${key}`)}
            </Button>
          ))}
        </EmptyStateActions>
        <EmptyStateActions>
          {suggestions.slice(3).map(({ key, icon }) => (
            <Button
              key={key}
              variant="tertiary"
              icon={icon}
              onClick={() => {
                const prompt = t(getIntroPromptKey(key));
                sendStreamMessage(prompt, {
                  requestPayload: { quickResponses: buildQuickResponsesPayload(key) },
                });
                navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
              }}
            >
              {t(`newChat.suggestion.${key}`)}
            </Button>
          ))}
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
