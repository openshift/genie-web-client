import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Stack,
  StackItem,
  Title,
  Content,
  Label,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { ModalDeck } from '@patternfly/react-component-groups/dist/dynamic/ModalDeck';
import Deck from '@patternfly/react-component-groups/dist/dynamic/Deck';
import onboardingData from './onboarding-content.json';
import WelcomeImg from '../../assets/images/onboarding/welcome.svg';
import AiCommandCenterImg from '../../assets/images/onboarding/ai-command-center.svg';
import CanvasModeImg from '../../assets/images/onboarding/canvas-mode.svg';
import SharingImg from '../../assets/images/onboarding/sharing.svg';
import './onboarding.css';

export const ONBOARDING_STORAGE_KEY = 'genie-onboarding-completed';

const imageMap = {
  welcome: WelcomeImg,
  'ai-command-center': AiCommandCenterImg,
  'canvas-mode': CanvasModeImg,
  sharing: SharingImg,
};

export const OnboardingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    if (!hasCompleted) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
  }, []);

  if (!isOpen) {
    return null;
  }

  const pages = onboardingData.map((page, index) => {
    const buttons = [];
    if (index > 0) {
      buttons.push({
        children: 'Back',
        variant: ButtonVariant.secondary,
        navigation: 'previous',
      });
    }
    if (index < onboardingData.length - 1) {
      buttons.push({
        children: 'Continue',
        variant: ButtonVariant.primary,
        navigation: 'next',
      });
    } else {
      buttons.push({
        children: 'Get Started',
        variant: ButtonVariant.primary,
        navigation: 'close',
      });
    }

    const content = (
      <Stack hasGutter>
        <StackItem>
          <img src={imageMap[page.image]} alt={page.alt} className="onboarding-img" />
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
              Read the Red Hat Privacy Statement
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
        'aria-label': 'Red Hat Genie onboarding walkthrough',
        className: 'genie-onboarding-modal',
      }}
    >
      <Deck
        pages={pages}
        onClose={handleComplete}
        onPageChange={setCurrentStep}
        ariaLabel="Red Hat Genie onboarding"
        ariaRoleDescription="onboarding walkthrough"
        contentFlexProps={{
          spaceItems: { default: 'spaceItemsXl' },
          gap: { default: 'gapXl' },
        }}
      />
    </ModalDeck>
  );
};
