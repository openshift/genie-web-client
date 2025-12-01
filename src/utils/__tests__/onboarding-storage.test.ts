import {
  hasCompletedOnboarding,
  setOnboardingCompleted,
  resetOnboardingStatus,
} from '../onboarding-storage';

// mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('onboarding-storage', () => {
  beforeEach(() => {
    // clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('hasCompletedOnboarding', () => {
    it('should return false when onboarding has not been completed', () => {
      expect(hasCompletedOnboarding()).toBe(false);
    });

    it('should return true when onboarding has been completed', () => {
      localStorage.setItem('genie-onboarding-completed', 'true');
      expect(hasCompletedOnboarding()).toBe(true);
    });

    it('should handle localStorage errors gracefully and return false', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const originalGetItem = localStorageMock.getItem;

      localStorageMock.getItem = jest.fn(() => {
        throw new Error('localStorage quota exceeded');
      });

      expect(hasCompletedOnboarding()).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to read onboarding status from localStorage:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
      localStorageMock.getItem = originalGetItem;
    });
  });

  describe('setOnboardingCompleted', () => {
    it('should set onboarding as completed in localStorage', () => {
      setOnboardingCompleted();
      expect(localStorage.getItem('genie-onboarding-completed')).toBe('true');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const originalSetItem = localStorageMock.setItem;

      localStorageMock.setItem = jest.fn(() => {
        throw new Error('localStorage quota exceeded');
      });

      // should not throw
      expect(() => setOnboardingCompleted()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save onboarding status to localStorage:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('resetOnboardingStatus', () => {
    it('should remove onboarding status from localStorage', () => {
      localStorage.setItem('genie-onboarding-completed', 'true');
      resetOnboardingStatus();
      expect(localStorage.getItem('genie-onboarding-completed')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const originalRemoveItem = localStorageMock.removeItem;

      localStorageMock.removeItem = jest.fn(() => {
        throw new Error('localStorage access denied');
      });

      // should not throw
      expect(() => resetOnboardingStatus()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to reset onboarding status in localStorage:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
      localStorageMock.removeItem = originalRemoveItem;
    });
  });
});
