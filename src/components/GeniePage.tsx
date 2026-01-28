import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import { AIProvider } from '../hooks/AIState';
import { ChatBarProvider } from './ChatBarContext';
import { DrawerProvider } from './drawer';
import { Layout } from './layout';
import { OnboardingModal } from './onboarding';
import { ThemeProvider } from './theme';
import { ToastAlertProvider } from './toast-alerts/ToastAlertProvider';
import { SplitScreenDrawerProvider } from './drawer/SplitScreenDrawerProvider';
import './genie.css';

export const GeniePage = () => {
  return (
    <ThemeProvider>
      <div className="global-layout-container">
        <AIProvider>
          <ChatBarProvider>
            <SplitScreenDrawerProvider>
              <DrawerProvider>
                <ToastAlertProvider>
                  <Layout />
                </ToastAlertProvider>
              </DrawerProvider>
            </SplitScreenDrawerProvider>
          </ChatBarProvider>
        </AIProvider>
        <OnboardingModal />
      </div>
    </ThemeProvider>
  );
};
