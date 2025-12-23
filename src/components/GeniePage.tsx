import { AIStateProvider } from '@redhat-cloud-services/ai-react-state';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import { ChatBarProvider } from './ChatBarContext';
import { DrawerProvider } from './drawer';
import { Layout } from './layout';
import { OnboardingModal } from './onboarding';
import { stateManager } from './utils/aiStateManager';
import './genie.css';

export const GeniePage = () => {
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
};
