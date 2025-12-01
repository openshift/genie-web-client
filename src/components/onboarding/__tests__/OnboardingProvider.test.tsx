import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingProvider } from '../OnboardingProvider';
import { useOnboarding } from '../OnboardingContext';
import * as onboardingStorage from '../../../utils/onboarding-storage';

// mock the onboarding storage module
jest.mock('../../../utils/onboarding-storage');

const mockedStorage = onboardingStorage as jest.Mocked<typeof onboardingStorage>;

// test component that uses the onboarding context
const TestComponent = () => {
  const { onboardingState, closeOnboarding, completeOnboarding } = useOnboarding();

  return (
    <div>
      <button onClick={closeOnboarding}>Close Onboarding</button>
      <button onClick={completeOnboarding}>Complete Onboarding</button>
      <div data-testid="onboarding-state">
        <span data-testid="has-completed">{String(onboardingState.hasCompletedOnboarding)}</span>
        <span data-testid="is-open">{String(onboardingState.isOnboardingOpen)}</span>
        <span data-testid="current-step">{onboardingState.currentStep}</span>
      </div>
    </div>
  );
};

describe('OnboardingProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // default: onboarding not completed
    mockedStorage.hasCompletedOnboarding.mockReturnValue(false);
  });

  it('should show onboarding for first-time users', async () => {
    mockedStorage.hasCompletedOnboarding.mockReturnValue(false);

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('has-completed')).toHaveTextContent('false');
      expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    });
  });

  it('should not show onboarding for returning users', async () => {
    mockedStorage.hasCompletedOnboarding.mockReturnValue(true);

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('has-completed')).toHaveTextContent('true');
      expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    });
  });

  it('should close onboarding without marking as complete', async () => {
    const user = userEvent.setup();

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>,
    );

    await user.click(screen.getByText('Close Onboarding'));

    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    expect(mockedStorage.setOnboardingCompleted).not.toHaveBeenCalled();
  });

  it('should complete onboarding and save to localStorage', async () => {
    mockedStorage.hasCompletedOnboarding.mockReturnValue(false);
    const user = userEvent.setup();

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>,
    );

    // wait for initial state
    await waitFor(() => {
      expect(screen.getByTestId('is-open')).toHaveTextContent('true');
    });

    // complete onboarding
    await user.click(screen.getByText('Complete Onboarding'));

    expect(mockedStorage.setOnboardingCompleted).toHaveBeenCalled();
    expect(screen.getByTestId('has-completed')).toHaveTextContent('true');
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
  });
});
