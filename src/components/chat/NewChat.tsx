import * as React from 'react';
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
  BugIcon,
  ImagesIcon,
  ListIcon,
  ProcessAutomationIcon,
  TrendUpIcon,
} from '@patternfly/react-icons';
import { useOutletContext } from 'react-router-dom-v5-compat';
import type { GenieOutletContext } from '../../types/types';
import { MessageBar } from '@patternfly/chatbot';

const NewChat = () => {
  const { t } = useTranslation('plugin__genie-web-client');

  const outlet = useOutletContext<GenieOutletContext | undefined>();
  const userName = outlet?.userName || '';
  const inlineBarRef = React.useRef<HTMLTextAreaElement>(null);

  const titleText = userName
    ? t('newChat.heading', { name: userName })
    : t('newChat.headingNoName');

  const suggestions: Array<{
    key: 'build' | 'automate' | 'troubleshoot' | 'analyze' | 'explore';
    icon?: React.ReactNode;
  }> = [
    { key: 'build', icon: <ImagesIcon /> },
    { key: 'automate', icon: <ProcessAutomationIcon /> },
    { key: 'troubleshoot', icon: <BugIcon /> },
    { key: 'analyze', icon: <TrendUpIcon /> },
    { key: 'explore', icon: <ListIcon /> },
  ];

  return (
    <EmptyState className="new-chat" variant="xl" titleText={titleText}>
      <EmptyStateBody className="pf-v6-u-font-size-lg">{t('newChat.description')}</EmptyStateBody>
        <MessageBar
          ref={inlineBarRef}
          aria-label={t('newChat.promptPlaceholder') as string}
          placeholder={t('newChat.promptPlaceholder') as string}
          onSendMessage={(message: string | number) => {
            console.log('new chat message:', message);
          }}
        />
      <EmptyStateFooter>
        <EmptyStateActions>
          {suggestions.slice(0, 3).map(({ key, icon }) => (
            <Button key={key} variant="secondary" icon={icon}>
              {t(`newChat.suggestion.${key}`)}
            </Button>
          ))}
        </EmptyStateActions>
        <EmptyStateActions>
          {suggestions.slice(3).map(({ key, icon }) => (
            <Button key={key} variant="secondary" icon={icon}>
              {t(`newChat.suggestion.${key}`)}
            </Button>
          ))}
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
}
export default NewChat;