import {
  EmptyState,
  EmptyStateBody,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerList,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import './Notifications.css';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  variant?: 'info' | 'success' | 'custom' | 'danger' | 'warning';
}

export const Notifications: React.FC = () => {
  const { t } = useTranslation('plugin__genie-web-client');

  // Mock data to simulate API response
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Cluster Upgrade Completed',
      description:
        'OpenShift cluster prod-cluster-01 has been successfully upgraded to version 4.12',
      timeAgo: '30 min ago',
      variant: 'success',
    },
    {
      id: '2',
      title: 'New Policy Violation Detected',
      description:
        'Non-compliant configuration found in frontend-service. Immediate action recommended.',
      timeAgo: '2 hrs ago',
      variant: 'danger',
    },
    {
      id: '3',
      title: 'Agent Upgrade Completed',
      description: 'Lightspeed agent has been successfully upgraded to version 2.4.6',
      timeAgo: '2 hrs ago',
      variant: 'success',
    },
    {
      id: '4',
      title: 'High CPU Usage Alert',
      description: 'CPU usage in node worker-02 has exceeded 90% for the past 15 minutes.',
      timeAgo: '2 hrs ago',
      variant: 'warning',
    },
    {
      id: '5',
      title: 'Appointment Scheduled',
      description:
        'Meeting with Sally from Red Hat Sales is scheduled for Wednesday, March 19, 2025 at 3:00 PM.',
      timeAgo: '4 hrs ago',
      variant: 'info',
    },
    {
      id: '6',
      title: 'Configuration Change',
      description: 'Steve modified a configuration file for your CY2025 migration plan.',
      timeAgo: '5 hrs ago',
      variant: 'info',
    },
  ];

  const hasNotifications = notifications.length > 0;

  if (!hasNotifications) {
    return (
      <EmptyState
        className="notifications empty-state"
        variant="sm"
        titleText={t('notifications.emptyState.heading')}
        headingLevel="h1"
      >
        <EmptyStateBody>{t('notifications.emptyState.description')}</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <NotificationDrawer className="notifications" aria-label={t('notifications.ariaLabel')}>
      <NotificationDrawerBody>
        <NotificationDrawerList>
          {notifications.map((n) => (
            <NotificationDrawerListItem key={n.id} variant={n.variant}>
              <NotificationDrawerListItemHeader title={n.title} variant={n.variant} />
              <NotificationDrawerListItemBody>
                <div>{n.description}</div>
                <small>{n.timeAgo}</small>
              </NotificationDrawerListItemBody>
            </NotificationDrawerListItem>
          ))}
        </NotificationDrawerList>
      </NotificationDrawerBody>
    </NotificationDrawer>
  );
};
