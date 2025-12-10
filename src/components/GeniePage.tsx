import { Layout } from './layout';
import { OnboardingModal } from './onboarding';
import { DrawerProvider } from './drawer';
import { AIStateProvider } from '@redhat-cloud-services/ai-react-state';
import { stateManager } from './utils/aiStateManager';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import './genie.css';

export default function GeniePage() {
  return (
    <div className="global-layout-container">
      <AIStateProvider stateManager={stateManager}>
        <DrawerProvider>
          <Layout />
        </DrawerProvider>
      </AIStateProvider>
      <OnboardingModal />
    </div>
  );
}
