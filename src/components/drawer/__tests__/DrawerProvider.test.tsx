import { render, screen, user } from '../../../unitTestUtils';

import { DrawerProvider } from '../DrawerProvider';
import { DrawerConfig, useDrawer } from '../DrawerContext';

const CheckDrawerState = (key: string, value: string) => {
  expect(
    screen.getByText((content) => content.includes(`${key}:`) && content.includes(String(value))),
  ).toBeInTheDocument();
};

const TestComponent = ({ openDrawerConfig }: { openDrawerConfig: DrawerConfig }) => {
  const { drawerState, openDrawer, closeDrawer } = useDrawer();
  return (
    <div>
      <button onClick={() => openDrawer(openDrawerConfig)}>Open Drawer</button>
      <button onClick={closeDrawer}>Close Drawer</button>
      <div>Drawer Content</div>
      {Object.keys(drawerState).map((key) => {
        const value = drawerState[key as keyof typeof drawerState];

        return (
          <div key={key}>
            {`${key}:`}
            {typeof value === 'function'
              ? 'function'
              : typeof value === 'boolean'
              ? String(value)
              : value}
          </div>
        );
      })}
    </div>
  );
};

const defaultOpenDrawerConfig: DrawerConfig = {
  heading: 'Drawer heading',
  icon: <>my icon</>,
  children: <>Drawer content</>,
  position: 'left',
};
describe('DrawerProvider and Context', () => {
  it('displays children when provided', () => {
    render(
      <DrawerProvider>
        <div>Test Content</div>
      </DrawerProvider>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('opens drawer with correct config when openDrawer is called', async () => {
    render(
      <DrawerProvider>
        <TestComponent openDrawerConfig={defaultOpenDrawerConfig} />
      </DrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));

    CheckDrawerState('icon', 'my icon');
    CheckDrawerState('isOpen', 'true');
    CheckDrawerState('heading', 'Drawer heading');
    CheckDrawerState('children', 'Drawer content');
    CheckDrawerState('position', 'left');
  });

  it('closes drawer when closeDrawer is called', async () => {
    render(
      <DrawerProvider>
        <TestComponent openDrawerConfig={defaultOpenDrawerConfig} />
      </DrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));

    CheckDrawerState('isOpen', 'true');

    await user.click(screen.getByText('Close Drawer'));

    CheckDrawerState('isOpen', 'false');
  });

  it('defaults position to right when not specified', async () => {
    render(
      <DrawerProvider>
        <TestComponent openDrawerConfig={{ ...defaultOpenDrawerConfig, position: undefined }} />
      </DrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));
    CheckDrawerState('position', 'right');
  });

  it('invokes custom onClose callback when drawer is closed', async () => {
    const mockedOnClose = jest.fn();
    render(
      <DrawerProvider>
        <TestComponent openDrawerConfig={{ ...defaultOpenDrawerConfig, onClose: mockedOnClose }} />
      </DrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));
    expect(mockedOnClose).not.toHaveBeenCalled();
    await user.click(screen.getByText('Close Drawer'));
    expect(mockedOnClose).toHaveBeenCalled();
  });

  it('updates drawer content when openDrawer is called multiple times', async () => {
    const { rerender } = render(
      <DrawerProvider>
        <TestComponent openDrawerConfig={defaultOpenDrawerConfig} />
      </DrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));
    CheckDrawerState('position', 'left');
    CheckDrawerState('heading', 'Drawer heading');

    rerender(
      <DrawerProvider>
        <TestComponent
          openDrawerConfig={{
            ...defaultOpenDrawerConfig,
            position: 'right',
            heading: 'My Other Drawer',
          }}
        />
      </DrawerProvider>,
    );
    await user.click(screen.getByText('Open Drawer'));
    CheckDrawerState('position', 'right');
    CheckDrawerState('heading', 'My Other Drawer');
  });

  it('throws error when useDrawer is used outside DrawerProvider', () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const ComponentOutsideProvider = () => {
      useDrawer();
      return <div>Should not render</div>;
    };

    expect(() => {
      render(<ComponentOutsideProvider />);
    }).toThrow('useDrawer must be used within a DrawerProvider');

    consoleSpy.mockRestore();
  });
});
