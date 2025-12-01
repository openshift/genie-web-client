const ONBOARDING_STORAGE_KEY = 'genie-onboarding-completed';

/**
 * Checks if the user has completed the onboarding flow
 */
export const hasCompletedOnboarding = (): boolean => {
  try {
    const value = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Failed to read onboarding status from localStorage:', error);
    return false;
  }
};

/**
 * Marks the onboarding as completed
 */
export const setOnboardingCompleted = (): void => {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Failed to save onboarding status to localStorage:', error);
  }
};

/**
 * Resets the onboarding status
 */
export const resetOnboardingStatus = (): void => {
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset onboarding status in localStorage:', error);
  }
};
