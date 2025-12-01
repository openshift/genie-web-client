import { render, screen, waitFor } from '@testing-library/react';
import { OnboardingModal } from '../OnboardingModal';
import { OnboardingProvider } from '../OnboardingProvider';
import * as onboardingStorage from '../../../utils/onboarding-storage';

// mock the onboarding storage module
jest.mock('../../../utils/onboarding-storage');

const mockedStorage = onboardingStorage as jest.Mocked<typeof onboardingStorage>;

describe('OnboardingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when onboarding is closed', async () => {
    mockedStorage.hasCompletedOnboarding.mockReturnValue(true);

    const { container } = render(
      <OnboardingProvider>
        <OnboardingModal />
      </OnboardingProvider>,
    );

    // Wait for useEffect to run, then check modal is not present
    await waitFor(() => {
      expect(container.querySelector('.onboarding-placeholder')).not.toBeInTheDocument();
    });
  });

  it('should render modal deck when onboarding is open', async () => {
    mockedStorage.hasCompletedOnboarding.mockReturnValue(false);

    render(
      <OnboardingProvider>
        <OnboardingModal />
      </OnboardingProvider>,
    );

    // Wait for and verify the welcome title from first step
    await waitFor(() => {
      expect(screen.getByText('Welcome to Red Hat Genie')).toBeInTheDocument();
    });

    // Verify first step description content
    expect(
      screen.getByText('Harness the full potential of the hybrid cloud, simply by asking.'),
    ).toBeInTheDocument();

    // Verify "Continue" button is present
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });
});
