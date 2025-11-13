import { DrawerProvider } from './global-drawer';
import { Layout } from './global-layout/Layout';
import '@patternfly/chatbot/dist/css/main.css';
import './genie.css';

export default function GeniePage() {
  return (
    <div className="global-layout-container">
      <DrawerProvider>
        <Layout />
      </DrawerProvider>
    </div>
  );
}
