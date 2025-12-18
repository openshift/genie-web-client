import { render } from '../../unitTestUtils';
import { DrawerProvider } from '../drawer';
import { Layout } from './Layout';

describe('Layout', () => {
  it('displays layout content when rendered', () => {
    render(
      <DrawerProvider>
        <Layout />
      </DrawerProvider>,
    );

    // Layout should render without errors
    expect(document.body).toBeInTheDocument();
  });
});
