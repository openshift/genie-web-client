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

  it('toggles drawer closed when same id is opened twice', async () => {
    const configWithId: DrawerConfig = {
      ...defaultOpenDrawerConfig,
      id: 'test-drawer',
    };

    render(
      <DrawerProvider>
        <TestComponent openDrawerConfig={configWithId} />
      </DrawerProvider>,
    );

    // Open the drawer
    await user.click(screen.getByText('Open Drawer'));
    CheckDrawerState('isOpen', 'true');
    CheckDrawerState('id', 'test-drawer');

    // Click open again with same id - should toggle closed
    await user.click(screen.getByText('Open Drawer'));
    CheckDrawerState('isOpen', 'false');
  });

  it('switches drawer content when different id is opened', async () => {
    const MultiDrawerTestComponent = () => {
      const { drawerState, openDrawer } = useDrawer();
      return (
        <div>
          <button
            onClick={() =>
              openDrawer({
                id: 'drawer-a',
                heading: 'Drawer A',
                icon: <>icon A</>,
                children: <>Content A</>,
                position: 'right',
              })
            }
          >
            Open Drawer A
          </button>
          <button
            onClick={() =>
              openDrawer({
                id: 'drawer-b',
                heading: 'Drawer B',
                icon: <>icon B</>,
                children: <>Content B</>,
                position: 'right',
              })
            }
          >
            Open Drawer B
          </button>
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

    render(
      <DrawerProvider>
        <MultiDrawerTestComponent />
      </DrawerProvider>,
    );

    // Open drawer A
    await user.click(screen.getByText('Open Drawer A'));
    CheckDrawerState('isOpen', 'true');
    CheckDrawerState('id', 'drawer-a');
    CheckDrawerState('heading', 'Drawer A');

    // Open drawer B - should switch to B, not close
    await user.click(screen.getByText('Open Drawer B'));
    CheckDrawerState('isOpen', 'true');
    CheckDrawerState('id', 'drawer-b');
    CheckDrawerState('heading', 'Drawer B');
  });

  it('invokes onClose callback when switching between drawers with ids', async () => {
    const mockedOnCloseA = jest.fn();
    const MultiDrawerTestComponent = () => {
      const { openDrawer } = useDrawer();
      return (
        <div>
          <button
            onClick={() =>
              openDrawer({
                id: 'drawer-a',
                heading: 'Drawer A',
                icon: <>icon A</>,
                children: <>Content A</>,
                onClose: mockedOnCloseA,
              })
            }
          >
            Open Drawer A
          </button>
          <button
            onClick={() =>
              openDrawer({
                id: 'drawer-b',
                heading: 'Drawer B',
                icon: <>icon B</>,
                children: <>Content B</>,
              })
            }
          >
            Open Drawer B
          </button>
        </div>
      );
    };

    render(
      <DrawerProvider>
        <MultiDrawerTestComponent />
      </DrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer A'));
    expect(mockedOnCloseA).not.toHaveBeenCalled();

    // Switch to drawer B - should call onClose for A
    await user.click(screen.getByText('Open Drawer B'));
    expect(mockedOnCloseA).toHaveBeenCalled();
  });
});
