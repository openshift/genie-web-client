import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stack,
  StackItem,
  Title,
  Content,
  Label,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { ModalDeck } from '@patternfly/react-component-groups/dist/dynamic/ModalDeck';
import Deck from '@patternfly/react-component-groups/dist/dynamic/Deck';
import WelcomeImg from '../../assets/images/onboarding/welcome.svg';
import AiCommandCenterImg from '../../assets/images/onboarding/ai-command-center.svg';
import CanvasModeImg from '../../assets/images/onboarding/canvas-mode.svg';
import SharingImg from '../../assets/images/onboarding/sharing.svg';
import './onboarding.css';

export const ONBOARDING_STORAGE_KEY = 'genie-onboarding-completed';
export const ONBOARDING_COMPLETED_USER_SETTING_KEY = 'genie.onboardingCompleted';

const imageMap: Record<string, string> = {
  welcome: WelcomeImg,
  'ai-command-center': AiCommandCenterImg,
  'canvas-mode': CanvasModeImg,
  sharing: SharingImg,
};

export const OnboardingModal: React.FC = () => {
  const { t } = useTranslation('plugin__genie-web-client');
  const [onboardingCompleted, setOnboardingCompleted, onboardingLoaded] = useUserSettings<boolean>(
    ONBOARDING_COMPLETED_USER_SETTING_KEY,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [, setCurrentStep] = useState(0);

  useEffect(() => {
    if (onboardingLoaded && !onboardingCompleted) {
      setIsOpen(true);
    }
  }, [onboardingLoaded, onboardingCompleted]);

  const handleComplete = useCallback(() => {
    setOnboardingCompleted(true);
    setIsOpen(false);
  }, [setOnboardingCompleted]);

  if (!isOpen) {
    return null;
  }

  const onboardingData = [
    {
      image: 'welcome',
      alt: t('onboarding.welcome.title'),
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.description'),
      imageSize: 'large',
    },
    {
      image: 'ai-command-center',
      alt: t('onboarding.aiCommandCenter.title'),
      label: t('onboarding.aiCommandCenter.label'),
      title: t('onboarding.aiCommandCenter.title'),
      description: t('onboarding.aiCommandCenter.description'),
    },
    {
      image: 'canvas-mode',
      alt: t('onboarding.canvasMode.title'),
      label: t('onboarding.canvasMode.label'),
      title: t('onboarding.canvasMode.title'),
      description: t('onboarding.canvasMode.description'),
    },
    {
      image: 'sharing',
      alt: t('onboarding.sharing.title'),
      label: t('onboarding.sharing.label'),
      title: t('onboarding.sharing.title'),
      description: t('onboarding.sharing.description'),
    },
    {
      image: 'welcome',
      alt: t('onboarding.privacy.title'),
      title: t('onboarding.privacy.title'),
      description: t('onboarding.privacy.description'),
      isPrivacyStep: true,
      imageSize: 'small',
    },
  ];

  const pages = onboardingData.map((page, index) => {
    const buttons = [];
    if (index > 0) {
      buttons.push({
        children: t('onboarding.buttons.back'),
        variant: ButtonVariant.secondary,
        navigation: 'previous' as const,
      });
    }
    if (index < onboardingData.length - 1) {
      buttons.push({
        children: t('onboarding.buttons.continue'),
        variant: ButtonVariant.primary,
        navigation: 'next' as const,
      });
    } else {
      buttons.push({
        children: t('onboarding.buttons.getStarted'),
        variant: ButtonVariant.primary,
        navigation: 'close' as const,
      });
    }

    const content = (
      <Stack hasGutter>
        <StackItem>
          <img
            src={imageMap[page.image]}
            alt={page.alt}
            className={`onboarding-img${
              page.imageSize ? ` onboarding-img--${page.imageSize}` : ''
            }`}
          />
        </StackItem>
        {page.label && (
          <StackItem>
            <Label>{page.label}</Label>
          </StackItem>
        )}
        <StackItem>
          <Title headingLevel="h2" size="2xl">
            {page.title}
          </Title>
        </StackItem>
        <StackItem>
          <Content component="p">
            <span dangerouslySetInnerHTML={{ __html: page.description }} />
          </Content>
        </StackItem>
        {page.isPrivacyStep && (
          <StackItem>
            <Button
              variant="link"
              isInline
              icon={<ExternalLinkAltIcon />}
              iconPosition="end"
              component="a"
              href="https://www.redhat.com/en/about/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('onboarding.privacy.linkText')}
            </Button>
          </StackItem>
        )}
      </Stack>
    );

    return {
      content,
      buttons,
    };
  });

  return (
    <ModalDeck
      isOpen={isOpen}
      modalProps={{
        'aria-label': t('onboarding.aria.modalLabel'),
        className: 'genie-onboarding-modal',
      }}
    >
      <Deck
        pages={pages}
        onClose={handleComplete}
        onPageChange={setCurrentStep}
        ariaLabel={t('onboarding.aria.deckLabel')}
        ariaRoleDescription={t('onboarding.aria.deckDescription')}
        contentFlexProps={{
          spaceItems: { default: 'spaceItemsXl' },
          gap: { default: 'gapXl' },
        }}
      />
    </ModalDeck>
  );
};
