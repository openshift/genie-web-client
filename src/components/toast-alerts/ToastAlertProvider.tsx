import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { Alert, AlertActionCloseButton, AlertGroup, type AlertProps } from '@patternfly/react-core';

/**
 * Custom alert type that requires an id for proper state management.
 * This ensures alerts can be uniquely identified and properly removed
 * when dismissed or timed out.
 */
export type ToastAlert = AlertProps & Required<Pick<AlertProps, 'id'>>;

interface ToastAlertContextValue {
  alerts: ToastAlert[];
  addAlert: (alert: ToastAlert) => void;
  removeAlert: (alert: Pick<ToastAlert, 'id'>) => void;
}

const ToastAlertContext = createContext<ToastAlertContextValue | undefined>(undefined);

export const useToastAlerts = (): ToastAlertContextValue => {
  const context = useContext(ToastAlertContext);

  if (context === undefined) {
    throw new Error('useToastAlerts must be used within a ToastAlertProvider');
  }

  return context;
};

interface ToastAlertProviderProps {
  children: ReactNode;
}

export const ToastAlertProvider = ({ children }: ToastAlertProviderProps) => {
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);

  const removeAlert = (alert: Pick<ToastAlert, 'id'>) => {
    setAlerts((prevAlerts) => prevAlerts.filter((a) => a.id !== alert.id));
  };

  const addAlert = (alert: ToastAlert) => {
    const newAlert = { ...alert };

    // The timeout prop must be set to false otherwise the alert will be removed automatically
    if (newAlert.timeout === undefined) {
      newAlert.timeout = true;
    }

    // The actionClose prop must be set to false otherwise the alert will not have a close button
    if (newAlert.actionClose === undefined) {
      newAlert.actionClose = (
        <AlertActionCloseButton onClose={() => removeAlert({ id: newAlert.id })} />
      );
    }
    setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
  };

  return (
    <ToastAlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
      <AlertGroup hasAnimations isToast isLiveRegion>
        {alerts.map((alert: ToastAlert) => (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - this seems to be a bug in PF
          <Alert key={alert.id} {...alert} onTimeout={() => removeAlert(alert)} />
        ))}
      </AlertGroup>
    </ToastAlertContext.Provider>
  );
};
