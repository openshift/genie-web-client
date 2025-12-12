import { AIStateProvider } from '@redhat-cloud-services/ai-react-state';
import { render } from '../../unitTestUtils';
import { stateManager } from '../utils/aiStateManager';
import { Layout } from './Layout';
import { DrawerProvider } from '../drawer';

describe('Layout', () => {
    const renderWithProviders = () =>
        render(
            <AIStateProvider stateManager={stateManager}>
                <DrawerProvider>
                    <Layout />
                </DrawerProvider>
            </AIStateProvider>,
        );
    it('renders without crashing', () => {
        renderWithProviders();
    });
});
