import { render, screen, user, waitFor } from '../../../unitTestUtils';
import { OnboardingModal, ALADDIN_PLUGIN_VERSION } from '../OnboardingModal';
import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk';

// Mock useUserSettings
const mockUseUserSettings = useUserSettings as jest.MockedFunction<typeof useUserSettings>;
const mockSetAladdinSettings = jest.fn();

describe('OnboardingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not render when onboarding has been completed', () => {
    const completedSettings = {
      onboarding: {
        version: ALADDIN_PLUGIN_VERSION,
        completed: true,
      },
      guidedTour: {
        completed: false,
        lastStep: 0,
      },
    };
    mockUseUserSettings.mockReturnValue([completedSettings, mockSetAladdinSettings, true]);

    render(<OnboardingModal />);

    expect(screen.queryByText('Welcome to Red Hat Project Aladdin')).not.toBeInTheDocument();
  });

  it('should render when onboarding has not been completed', () => {
    // The modal shows when version doesn't match AND completed is false
    // To trigger showing, we need version to not match
    const oldVersionSettings = {
      onboarding: {
        version: '0.0.0', // Different version
        completed: false,
      },
      guidedTour: {
        completed: false,
        lastStep: 0,
      },
    };
    mockUseUserSettings.mockReturnValue([oldVersionSettings, mockSetAladdinSettings, true]);

    render(<OnboardingModal />);

    expect(screen.getByText('Welcome to Red Hat Project Aladdin')).toBeInTheDocument();
    expect(
      screen.getByText('Harness the full potential of the hybrid cloud, simply by asking.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('should set completion in storage when the flow is finished', async () => {
    const initialSettings = {
      onboarding: {
        version: '0.0.0', // Different version to trigger modal
        completed: false,
      },
      guidedTour: {
        completed: false,
        lastStep: 0,
      },
    };
    mockUseUserSettings.mockReturnValue([initialSettings, mockSetAladdinSettings, true]);
    render(<OnboardingModal />);

    expect(screen.getByText('Welcome to Red Hat Project Aladdin')).toBeInTheDocument();

    // navigate through all 5 pages
    const totalPages = 5;
    for (let i = 0; i < totalPages - 1; i++) {
      const continueButton = await screen.findByRole('button', { name: /continue/i });
      await user.click(continueButton);
    }

    const getStartedButton = await screen.findByRole('button', { name: /get started/i });
    await user.click(getStartedButton);

    expect(mockSetAladdinSettings).toHaveBeenCalledWith({
      ...initialSettings,
      onboarding: { ...initialSettings.onboarding, completed: true },
    });

    // Wait for modal to disappear after completion
    await waitFor(() => {
      expect(screen.queryByText('Welcome to Red Hat Project Aladdin')).not.toBeInTheDocument();
    });
  });
});
