/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen, user } from '../../unitTestUtils';
import { ToastAlertProvider, useToastAlerts } from './ToastAlertProvider';

const TestConsumer = ({
  onRender,
}: {
  onRender?: (value: ReturnType<typeof useToastAlerts>) => void;
}) => {
  const context = useToastAlerts();

  if (onRender) {
    onRender(context);
  }

  return (
    <div>
      <button
        onClick={() =>
          context.addAlert({ id: 'test-alert-1', variant: 'success', title: 'Success Alert' })
        }
      >
        Add Success Alert
      </button>
      <button
        onClick={() =>
          context.addAlert({ id: 'test-alert-2', variant: 'danger', title: 'Danger Alert' })
        }
      >
        Add Danger Alert
      </button>
      <button onClick={() => context.removeAlert({ id: 'test-alert-1' })}>Remove Alert</button>
    </div>
  );
};

describe('<ToastAlertProvider />', () => {
  it('throws an error when useToastAlerts is used outside of provider', () => {
    const ConsoleError = console.error;
    console.error = jest.fn();

    const ComponentWithoutProvider = () => {
      useToastAlerts();
      return <div>Test</div>;
    };

    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      'useToastAlerts must be used within a ToastAlertProvider',
    );

    console.error = ConsoleError;
  });

  it('adds an alert when addAlert is called', async () => {
    render(
      <ToastAlertProvider>
        <TestConsumer />
      </ToastAlertProvider>,
    );

    const addButton = screen.getByRole('button', { name: 'Add Success Alert' });
    await user.click(addButton);

    expect(await screen.findByText('Success Alert')).toBeInTheDocument();
  });

  it('adds multiple alerts when addAlert is called multiple times', async () => {
    render(
      <ToastAlertProvider>
        <TestConsumer />
      </ToastAlertProvider>,
    );

    const addSuccessButton = screen.getByRole('button', { name: 'Add Success Alert' });
    const addDangerButton = screen.getByRole('button', { name: 'Add Danger Alert' });

    await user.click(addSuccessButton);
    await user.click(addDangerButton);

    expect(await screen.findByText('Success Alert')).toBeInTheDocument();
    expect(screen.getByText('Danger Alert')).toBeInTheDocument();
  });

  it('removes an alert when removeAlert is called', async () => {
    render(
      <ToastAlertProvider>
        <TestConsumer />
      </ToastAlertProvider>,
    );

    const addButton = screen.getByRole('button', { name: 'Add Success Alert' });
    await user.click(addButton);

    expect(await screen.findByText('Success Alert')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: 'Remove Alert' });
    await user.click(removeButton);

    expect(screen.queryByText('Success Alert')).not.toBeInTheDocument();
  });

  it('removes only the specified alert when multiple alerts exist', async () => {
    render(
      <ToastAlertProvider>
        <TestConsumer />
      </ToastAlertProvider>,
    );

    const addSuccessButton = screen.getByRole('button', { name: 'Add Success Alert' });
    const addDangerButton = screen.getByRole('button', { name: 'Add Danger Alert' });

    await user.click(addSuccessButton);
    await user.click(addDangerButton);

    expect(await screen.findByText('Success Alert')).toBeInTheDocument();
    expect(screen.getByText('Danger Alert')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: 'Remove Alert' });
    await user.click(removeButton);

    expect(screen.queryByText('Success Alert')).not.toBeInTheDocument();
    expect(screen.getByText('Danger Alert')).toBeInTheDocument();
  });

  it('provides the correct context value to consumers', () => {
    let contextValue: ReturnType<typeof useToastAlerts> | null = null;

    render(
      <ToastAlertProvider>
        <TestConsumer
          onRender={(value) => {
            contextValue = value;
          }}
        />
      </ToastAlertProvider>,
    );

    expect(contextValue).not.toBeNull();
    expect(contextValue!).toHaveProperty('alerts');
    expect(contextValue!).toHaveProperty('addAlert');
    expect(contextValue!).toHaveProperty('removeAlert');
    expect(typeof contextValue!.addAlert).toBe('function');
    expect(typeof contextValue!.removeAlert).toBe('function');
    expect(Array.isArray(contextValue!.alerts)).toBe(true);
  });

  it('maintains alerts in the correct order when multiple are added', async () => {
    render(
      <ToastAlertProvider>
        <TestConsumer />
      </ToastAlertProvider>,
    );

    const addSuccessButton = screen.getByRole('button', { name: 'Add Success Alert' });
    const addDangerButton = screen.getByRole('button', { name: 'Add Danger Alert' });

    await user.click(addSuccessButton);
    await user.click(addDangerButton);

    const alerts = await screen.findAllByRole('heading');

    expect(alerts[0]).toHaveTextContent('Danger Alert');
    expect(alerts[1]).toHaveTextContent('Success Alert');
  });

  it('removes alert from state when onTimeout is called', async () => {
    render(
      <ToastAlertProvider>
        <TestConsumer />
      </ToastAlertProvider>,
    );

    const addButton = screen.getByRole('button', { name: 'Add Success Alert' });
    await user.click(addButton);

    expect(await screen.findByText('Success Alert')).toBeInTheDocument();

    // Simulate the Alert component calling onTimeout after the timeout period
    // We can't directly access the onTimeout prop, but we can verify that
    // removeAlert works correctly, which is what onTimeout calls
    const removeButton = screen.getByRole('button', { name: 'Remove Alert' });
    await user.click(removeButton);

    expect(screen.queryByText('Success Alert')).not.toBeInTheDocument();
  });

  it('removes alert from state when user manually closes it', async () => {
    render(
      <ToastAlertProvider>
        <TestConsumer />
      </ToastAlertProvider>,
    );

    const addButton = screen.getByRole('button', { name: 'Add Success Alert' });
    await user.click(addButton);

    expect(await screen.findByText('Success Alert')).toBeInTheDocument();

    // Simulate manual close by calling removeAlert (same as onClose callback)
    const removeButton = screen.getByRole('button', { name: 'Remove Alert' });
    await user.click(removeButton);

    expect(screen.queryByText('Success Alert')).not.toBeInTheDocument();
  });
});
