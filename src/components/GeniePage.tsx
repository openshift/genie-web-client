import { Layout } from './layout';
import { OnboardingModal } from './onboarding';
import { DrawerProvider } from './drawer';
import { AIStateProvider } from '@redhat-cloud-services/ai-react-state';
import { stateManager } from './utils/aiStateManager';
import { ChatBarProvider } from './ChatBarContext';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import './genie.css';

// TODO:  Add a context to hide/show the search bar
// OR we can add /error to the end of the route to hide the search bar

export default function GeniePage() {
  return (
    <div className="global-layout-container">
      <AIStateProvider stateManager={stateManager}>
        <ChatBarProvider>
          <DrawerProvider>
            <Layout />
          </DrawerProvider>
        </ChatBarProvider>
      </AIStateProvider>
      <OnboardingModal />
    </div>
  );
}
