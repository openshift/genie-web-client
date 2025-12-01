import * as React from 'react';
import { Stack, StackItem, Title, Content, Label, Button } from '@patternfly/react-core';
import { ButtonVariant } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import WelcomeImg from '../../assets/images/onboarding/welcome.svg';
import AiCommandCenterImg from '../../assets/images/onboarding/ai-command-center.svg';
import CanvasModeImg from '../../assets/images/onboarding/canvas-mode.svg';
import SharingImg from '../../assets/images/onboarding/sharing.svg';

export interface DeckButton {
  children: React.ReactNode;
  variant?: ButtonVariant;
  navigation?: 'next' | 'previous' | 'close';
  onClick?: () => void;
}

export interface DeckPage {
  content: React.ReactNode;
  buttons: DeckButton[];
}

interface IllustrationProps {
  src: string;
  alt: string;
}

const Illustration: React.FC<IllustrationProps> = ({ src, alt }) => (
  <div
    style={{
      width: '100%',
      maxWidth: '280px',
      height: '200px',
      margin: '0 auto',
      backgroundImage: `url(${src})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      borderRadius: '8px',
    }}
    role="img"
    aria-label={alt}
  />
);

export const ONBOARDING_PAGES: DeckPage[] = [
  // step 1: Welcome
  {
    content: (
      <Stack hasGutter>
        <StackItem>
          <Illustration src={WelcomeImg} alt="Welcome to Red Hat Genie illustration" />
        </StackItem>
        <StackItem>
          <Title headingLevel="h2" size="2xl">
            Welcome to Red Hat Genie
          </Title>
        </StackItem>
        <StackItem>
          <Content component="p">
            Harness the full potential of the hybrid cloud, simply by asking.
          </Content>
        </StackItem>
      </Stack>
    ),
    buttons: [
      {
        children: 'Continue',
        variant: ButtonVariant.primary,
        navigation: 'next',
      },
    ],
  },

  // step 2: AI command center
  {
    content: (
      <Stack hasGutter>
        <StackItem>
          <Illustration src={AiCommandCenterImg} alt="AI Command Center illustration" />
        </StackItem>
        <StackItem>
          <Label color="grey">AI Command Center</Label>
        </StackItem>
        <StackItem>
          <Title headingLevel="h2" size="2xl">
            Intelligence at your command
          </Title>
        </StackItem>
        <StackItem>
          <Content component="p">
            Ask anything. Get answers. Troubleshoot, analyze, and understand your entire fleet just
            by asking. It&apos;s the power of your data, in plain language.
          </Content>
        </StackItem>
      </Stack>
    ),
    buttons: [
      {
        children: 'Back',
        variant: ButtonVariant.secondary,
        navigation: 'previous',
      },
      {
        children: 'Continue',
        variant: ButtonVariant.primary,
        navigation: 'next',
      },
    ],
  },

  // step 3: Canvas Mode
  {
    content: (
      <Stack hasGutter>
        <StackItem>
          <Illustration src={CanvasModeImg} alt="Canvas Mode illustration" />
        </StackItem>
        <StackItem>
          <Label color="grey">Canvas Mode</Label>
        </StackItem>
        <StackItem>
          <Title headingLevel="h2" size="2xl">
            Go from conversation to clarity.
          </Title>
        </StackItem>
        <StackItem>
          <Content component="p">
            Transform answers into custom dashboards. In Canvas Mode, you can effortlessly arrange,
            customize, and build the precise view you need to monitor what matters most.
          </Content>
        </StackItem>
      </Stack>
    ),
    buttons: [
      {
        children: 'Back',
        variant: ButtonVariant.secondary,
        navigation: 'previous',
      },
      {
        children: 'Continue',
        variant: ButtonVariant.primary,
        navigation: 'next',
      },
    ],
  },

  // step 4: Sharing
  {
    content: (
      <Stack hasGutter>
        <StackItem>
          <Illustration src={SharingImg} alt="Sharing illustration" />
        </StackItem>
        <StackItem>
          <Label color="grey">Sharing</Label>
        </StackItem>
        <StackItem>
          <Title headingLevel="h2" size="2xl">
            Share your vision. Instantly.
          </Title>
        </StackItem>
        <StackItem>
          <Content component="p">
            An insight is only powerful when it&apos;s shared. Save any view to your library and
            share it with your team in a single click. Drive decisions, together.
          </Content>
        </StackItem>
      </Stack>
    ),
    buttons: [
      {
        children: 'Back',
        variant: ButtonVariant.secondary,
        navigation: 'previous',
      },
      {
        children: 'Continue',
        variant: ButtonVariant.primary,
        navigation: 'next',
      },
    ],
  },

  // step 5: Privacy Notice
  {
    content: (
      <Stack hasGutter>
        <StackItem>
          <Illustration src={WelcomeImg} alt="Privacy notice illustration" />
        </StackItem>
        <StackItem>
          <Title headingLevel="h2" size="2xl">
            Important privacy notice
          </Title>
        </StackItem>
        <StackItem>
          <Content component="p">
            <strong>Project Genie is powered by generative AI.</strong> To protect your security,
            please do not include personal information or sensitive data (like secrets or API keys)
            in your conversations.
          </Content>
        </StackItem>
        <StackItem>
          <Content component="p">
            Your interactions may be used to improve Red Hat products and services.
          </Content>
        </StackItem>
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
      </Stack>
    ),
    buttons: [
      {
        children: 'Back',
        variant: ButtonVariant.secondary,
        navigation: 'previous',
      },
      {
        children: 'Get Started',
        variant: ButtonVariant.primary,
        navigation: 'close',
      },
    ],
  },
];
