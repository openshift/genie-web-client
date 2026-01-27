import { render, screen, user } from '../../../unitTestUtils';

import { SplitScreenDrawerProvider } from '../SplitScreenDrawerProvider';
import { SplitScreenDrawerConfig, useSplitScreenDrawer } from '../SplitScreenDrawerContext';

const CheckDrawerState = (key: string, value: string) => {
  expect(
    screen.getByText((content) => content.includes(`${key}:`) && content.includes(String(value))),
  ).toBeInTheDocument();
};

const TestComponent = ({ openDrawerConfig }: { openDrawerConfig: SplitScreenDrawerConfig }) => {
  const { splitScreenDrawerState, openSplitScreenDrawer, closeSplitScreenDrawer } =
    useSplitScreenDrawer();
  return (
    <div>
      <button onClick={() => openSplitScreenDrawer(openDrawerConfig)}>Open Drawer</button>
      <button onClick={closeSplitScreenDrawer}>Close Drawer</button>
      <div>Drawer Content</div>
      {Object.keys(splitScreenDrawerState).map((key) => {
        const value = splitScreenDrawerState[key as keyof typeof splitScreenDrawerState];

        return (
          <div key={key}>
            {`${key}:`}
            {typeof value === 'function'
              ? 'function'
              : typeof value === 'boolean'
              ? String(value)
              : typeof value === 'object' && value !== null && 'type' in value
              ? 'ReactNode'
              : value}
          </div>
        );
      })}
    </div>
  );
};

const defaultOpenDrawerConfig: SplitScreenDrawerConfig = {
  children: <>Drawer content</>,
  position: 'left',
};

describe('SplitScreenDrawerProvider and Context', () => {
  it('displays children when provided', () => {
    render(
      <SplitScreenDrawerProvider>
        <div>Test Content</div>
      </SplitScreenDrawerProvider>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('opens drawer with correct config when openSplitScreenDrawer is called', async () => {
    render(
      <SplitScreenDrawerProvider>
        <TestComponent openDrawerConfig={defaultOpenDrawerConfig} />
      </SplitScreenDrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));

    CheckDrawerState('isOpen', 'true');
    CheckDrawerState('children', 'ReactNode');
    CheckDrawerState('position', 'left');
  });

  it('closes drawer when closeSplitScreenDrawer is called', async () => {
    render(
      <SplitScreenDrawerProvider>
        <TestComponent openDrawerConfig={defaultOpenDrawerConfig} />
      </SplitScreenDrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));

    CheckDrawerState('isOpen', 'true');

    await user.click(screen.getByText('Close Drawer'));

    CheckDrawerState('isOpen', 'false');
  });

  it('defaults position to right when not specified', async () => {
    render(
      <SplitScreenDrawerProvider>
        <TestComponent openDrawerConfig={{ ...defaultOpenDrawerConfig, position: undefined }} />
      </SplitScreenDrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));
    CheckDrawerState('position', 'right');
  });

  it('invokes custom onClose callback when drawer is closed', async () => {
    const mockedOnClose = jest.fn();
    render(
      <SplitScreenDrawerProvider>
        <TestComponent openDrawerConfig={{ ...defaultOpenDrawerConfig, onClose: mockedOnClose }} />
      </SplitScreenDrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));
    expect(mockedOnClose).not.toHaveBeenCalled();
    await user.click(screen.getByText('Close Drawer'));
    expect(mockedOnClose).toHaveBeenCalled();
  });

  it('updates drawer content when openSplitScreenDrawer is called multiple times', async () => {
    const { rerender } = render(
      <SplitScreenDrawerProvider>
        <TestComponent openDrawerConfig={defaultOpenDrawerConfig} />
      </SplitScreenDrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));
    CheckDrawerState('position', 'left');

    rerender(
      <SplitScreenDrawerProvider>
        <TestComponent
          openDrawerConfig={{
            ...defaultOpenDrawerConfig,
            position: 'right',
            children: <>Updated content</>,
          }}
        />
      </SplitScreenDrawerProvider>,
    );
    await user.click(screen.getByText('Open Drawer'));
    CheckDrawerState('position', 'right');
  });

  it('throws error when useSplitScreenDrawer is used outside SplitScreenDrawerProvider', () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const ComponentOutsideProvider = () => {
      useSplitScreenDrawer();
      return <div>Should not render</div>;
    };

    expect(() => {
      render(<ComponentOutsideProvider />);
    }).toThrow('useSplitScreenDrawer must be used within a SplitScreenDrawerProvider');

    consoleSpy.mockRestore();
  });

  it('preserves previous state properties when closing drawer', async () => {
    render(
      <SplitScreenDrawerProvider>
        <TestComponent openDrawerConfig={defaultOpenDrawerConfig} />
      </SplitScreenDrawerProvider>,
    );

    await user.click(screen.getByText('Open Drawer'));
    CheckDrawerState('isOpen', 'true');
    CheckDrawerState('position', 'left');

    await user.click(screen.getByText('Close Drawer'));
    CheckDrawerState('isOpen', 'false');
    // Position should still be preserved from previous state
    CheckDrawerState('position', 'left');
  });
});
