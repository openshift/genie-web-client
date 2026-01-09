import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import { AIProvider } from '../hooks/AIState';
import { ChatBarProvider } from './ChatBarContext';
import { DrawerProvider } from './drawer';
import { Layout } from './layout';
import { OnboardingModal } from './onboarding';
import './genie.css';

export const GeniePage = () => {
  return (
    <div className="global-layout-container">
      <AIProvider>
        <ChatBarProvider>
          <DrawerProvider>
            <Layout />
          </DrawerProvider>
        </ChatBarProvider>
      </AIProvider>
      <OnboardingModal />
    </div>
  );
};
