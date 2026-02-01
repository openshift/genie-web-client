import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import {
  RhStandardBarGraphIcon,
  RhStandardBugIcon,
  RhStandardCommandLineIcon,
  RhUiAiExperienceIcon,
  RhUiAnalyzeIcon,
} from '@patternfly/react-icons';
import { useCallback, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateNewConversation, useInjectBotMessage } from '../../hooks/AIState';
import { useNavigate } from 'react-router-dom-v5-compat';
import { buildQuickResponsesPayload, getIntroPromptKey, type SuggestionKey } from './suggestions';
import { mainGenieRoute, SubRoutes } from '../routeList';
import './NewChat.css';
import { ChatMessageBar } from '../chat/ChatMessageBar';

export const NewChat: React.FC = () => {
  const { t } = useTranslation('plugin__genie-web-client');
  const [userName, setUserName] = useState<string>('');
  const injectBotMessage = useInjectBotMessage();
  const navigate = useNavigate();
  const createNewConversation = useCreateNewConversation();

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

  useEffect(() => {
    const initializeConversation = async () => {
      await createNewConversation();
    };
    initializeConversation();
  }, [createNewConversation]);

  const titleText = userName
    ? t('newChat.heading', { name: userName })
    : t('newChat.headingNoName');

  const handleSuggestionClick = useCallback(
    (key: SuggestionKey) => {
      const introMessage = t(getIntroPromptKey(key));
      const quickResponsesPayload = buildQuickResponsesPayload(key);

      // Inject a bot message with quick responses (no API call)
      injectBotMessage({
        answer: introMessage,
        additionalAttributes: {
          quickResponses: quickResponsesPayload,
        },
      });

      navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
    },
    [t, injectBotMessage, navigate],
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
      <ChatMessageBar
        onSendMessage={() => {
          navigate(`${mainGenieRoute}/${SubRoutes.Chat}`);
        }}
      />
      <EmptyStateFooter>
        <EmptyStateActions>
          {suggestions.slice(0, 3).map(({ key, icon }) => (
            <Button
              key={key}
              variant="tertiary"
              icon={icon}
              onClick={() => handleSuggestionClick(key)}
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
              onClick={() => handleSuggestionClick(key)}
            >
              {t(`newChat.suggestion.${key}`)}
            </Button>
          ))}
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
