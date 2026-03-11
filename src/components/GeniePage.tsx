import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import { ComponentHandlerRegistryProvider } from '@rhngui/patternfly-react-renderer';
import { AIProvider } from '../hooks/AIState';
import { DrawerProvider } from './drawer';
import { Layout } from './layout';
import { OnboardingModal } from './onboarding';
import { ThemeProvider } from './theme';
import './genie.css';
import { ToastAlertProvider } from './toast-alerts/ToastAlertProvider';
import { FieldFormatters } from './artifacts/formatters';

export const GeniePage = () => {
  return (
    <ComponentHandlerRegistryProvider>
      <ThemeProvider>
        <div className="global-layout-container">
          <AIProvider>
            <DrawerProvider>
              <ToastAlertProvider>
                <Layout />
              </ToastAlertProvider>
            </DrawerProvider>
          </AIProvider>
          <OnboardingModal />
        </div>
      </ThemeProvider>
      <FieldFormatters />
    </ComponentHandlerRegistryProvider>
  );
};
