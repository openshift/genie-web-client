import { FC, ReactNode, useState, useCallback, useMemo, useEffect } from 'react';
import { OnboardingContext, OnboardingState, OnboardingContextValue } from './OnboardingContext';
import { hasCompletedOnboarding, setOnboardingCompleted } from '../../utils/onboarding-storage';

interface OnboardingProviderProps {
  children: ReactNode;
}

/**
 * Provider component for onboarding state management
 */
export const OnboardingProvider: FC<OnboardingProviderProps> = ({ children }) => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    hasCompletedOnboarding: false,
    isOnboardingOpen: false,
    currentStep: 0,
  });

  useEffect(() => {
    const completed = hasCompletedOnboarding();
    setOnboardingState((prev) => ({
      ...prev,
      hasCompletedOnboarding: completed,
      isOnboardingOpen: !completed,
    }));
  }, []);

  const startOnboarding = useCallback(() => {
    setOnboardingState({
      hasCompletedOnboarding: false,
      isOnboardingOpen: true,
      currentStep: 0,
    });
  }, []);

  const closeOnboarding = useCallback(() => {
    setOnboardingState((prev) => ({
      ...prev,
      isOnboardingOpen: false,
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted();
    setOnboardingState({
      hasCompletedOnboarding: true,
      isOnboardingOpen: false,
      currentStep: 0,
    });
  }, []);

  const handlePageChange = useCallback((index: number) => {
    setOnboardingState((prev) => ({
      ...prev,
      currentStep: index,
    }));
  }, []);

  const contextValue = useMemo<OnboardingContextValue>(
    () => ({
      onboardingState,
      startOnboarding,
      closeOnboarding,
      completeOnboarding,
      handlePageChange,
    }),
    [onboardingState, startOnboarding, closeOnboarding, completeOnboarding, handlePageChange],
  );

  return <OnboardingContext.Provider value={contextValue}>{children}</OnboardingContext.Provider>;
};
