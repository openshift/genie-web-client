import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingModal, ONBOARDING_STORAGE_KEY } from '../OnboardingModal';

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
