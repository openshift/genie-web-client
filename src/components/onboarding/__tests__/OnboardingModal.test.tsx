import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingModal, ONBOARDING_STORAGE_KEY } from '../OnboardingModal';

// mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'onboarding.welcome.title': 'Welcome to Red Hat Genie',
        'onboarding.welcome.description':
          'Harness the full potential of the hybrid cloud, simply by asking.',
        'onboarding.aiCommandCenter.label': 'AI Command Center',
        'onboarding.aiCommandCenter.title': 'Intelligence at your command',
        'onboarding.aiCommandCenter.description':
          "Ask anything. Get answers. Troubleshoot, analyze, and understand your entire fleet just by asking. It's the power of your data, in plain language.",
        'onboarding.canvasMode.label': 'Canvas Mode',
        'onboarding.canvasMode.title': 'Go from conversation to clarity.',
        'onboarding.canvasMode.description':
          'Transform answers into custom dashboards. In Canvas Mode, you can effortlessly arrange, customize, and build the precise view you need to monitor what matters most.',
        'onboarding.sharing.label': 'Sharing',
        'onboarding.sharing.title': 'Share your vision. Instantly.',
        'onboarding.sharing.description':
          "An insight is only powerful when it's shared. Save any view to your library and share it with your team in a single click. Drive decisions, together.",
        'onboarding.privacy.title': 'Important privacy notice',
        'onboarding.privacy.description':
          '<strong>Project Genie is powered by generative AI.</strong> To protect your security, please do not include personal information or sensitive data (like secrets or API keys) in your conversations.<br/><br/>Your interactions may be used to improve Red Hat products and services.',
        'onboarding.privacy.linkText': 'Read the Red Hat Privacy Statement',
        'onboarding.buttons.continue': 'Continue',
        'onboarding.buttons.back': 'Back',
        'onboarding.buttons.getStarted': 'Get Started',
        'onboarding.aria.modalLabel': 'Red Hat Genie onboarding walkthrough',
        'onboarding.aria.deckLabel': 'Red Hat Genie onboarding',
        'onboarding.aria.deckDescription': 'onboarding walkthrough',
      };
      return translations[key] || key;
    },
  }),
}));

describe('OnboardingModal', () => {
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeEach(() => {
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not render when onboarding has been completed', () => {
    getItemSpy.mockReturnValue('true');

    render(<OnboardingModal />);

    expect(screen.queryByText('Welcome to Red Hat Genie')).not.toBeInTheDocument();
  });

  it('should render when onboarding has not been completed', () => {
    getItemSpy.mockReturnValue(null);

    render(<OnboardingModal />);

    expect(screen.getByText('Welcome to Red Hat Genie')).toBeInTheDocument();
    expect(
      screen.getByText('Harness the full potential of the hybrid cloud, simply by asking.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('should set completion in storage when the flow is finished', async () => {
    getItemSpy.mockReturnValue(null);
    const user = userEvent.setup();
    render(<OnboardingModal />);

    expect(screen.getByText('Welcome to Red Hat Genie')).toBeInTheDocument();

    // navigate through all 5 pages
    const totalPages = 5;
    for (let i = 0; i < totalPages - 1; i++) {
      const continueButton = await screen.findByRole('button', { name: /continue/i });
      await user.click(continueButton);
    }

    const getStartedButton = await screen.findByRole('button', { name: /get started/i });
    await user.click(getStartedButton);

    expect(setItemSpy).toHaveBeenCalledWith(ONBOARDING_STORAGE_KEY, 'true');

    await waitFor(() => {
      expect(screen.queryByText('Welcome to Red Hat Genie')).not.toBeInTheDocument();
    });
  });
});
