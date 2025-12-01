import { createContext, useContext } from 'react';

/**
 * Onboarding state interface
 */
export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  isOnboardingOpen: boolean;
  currentStep: number;
}

/**
 * Onboarding context value interface
 */
export interface OnboardingContextValue {
  onboardingState: OnboardingState;
  startOnboarding: () => void;
  closeOnboarding: () => void;
  completeOnboarding: () => void;
  handlePageChange: (index: number) => void;
}

export const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

/**
 * Hook to access onboarding context
 */
export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
