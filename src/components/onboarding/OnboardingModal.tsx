import * as React from 'react';
import { useCallback } from 'react';
import { useOnboarding } from './OnboardingContext';
import { ONBOARDING_PAGES } from './onboarding-content';
import Deck from '@patternfly/react-component-groups/dist/dynamic/Deck';
import { ModalDeck } from '@patternfly/react-component-groups/dist/dynamic/ModalDeck';
import './onboarding.css';

/**
 * Displays a 5-step onboarding flow for first-time users
 */
export const OnboardingModal: React.FC = () => {
  const { onboardingState, completeOnboarding, handlePageChange } = useOnboarding();

  const handleClose = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  if (!onboardingState.isOnboardingOpen) {
    return null;
  }

  return (
    <ModalDeck
      isOpen={onboardingState.isOnboardingOpen}
      modalProps={{
        'aria-label': 'Red Hat Genie onboarding walkthrough',
      }}
    >
      <Deck
        pages={ONBOARDING_PAGES}
        onClose={handleClose}
        onPageChange={handlePageChange}
        ariaLabel="Red Hat Genie onboarding"
        ariaRoleDescription="onboarding walkthrough"
        contentFlexProps={{
          spaceItems: { default: 'spaceItemsXl' },
        }}
      />
    </ModalDeck>
  );
};
