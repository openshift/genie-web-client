import { DrawerProvider } from './global-drawer';
import { Layout } from './global-layout/Layout';
import { OnboardingProvider, OnboardingModal } from './onboarding';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import './genie.css';

export default function GeniePage() {
  return (
    <div className="global-layout-container">
      <OnboardingProvider>
        <DrawerProvider>
          <Layout />
        </DrawerProvider>
        <OnboardingModal />
      </OnboardingProvider>
    </div>
  );
}
