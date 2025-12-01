import { render } from '@testing-library/react';
import { useOnboarding } from '../OnboardingContext';

// test component that tries to use the context without provider
const TestComponentWithoutProvider = () => {
  const context = useOnboarding();
  return <div>{context.onboardingState.hasCompletedOnboarding.toString()}</div>;
};

describe('useOnboarding', () => {
  it('should throw an error when used outside OnboardingProvider', () => {
    // suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useOnboarding must be used within an OnboardingProvider');

    consoleErrorSpy.mockRestore();
  });
});
