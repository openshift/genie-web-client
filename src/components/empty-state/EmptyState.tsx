import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';

export interface AppEmptyStateAction {
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
  icon?: React.ReactNode;
}

export interface AppEmptyStateProps {
  heading: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: AppEmptyStateAction;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  heading,
  description,
  primaryAction,
}) => {
  return (
    <EmptyState titleText={heading} headingLevel="h1">
      {description && <EmptyStateBody>{description}</EmptyStateBody>}
      <EmptyStateFooter>
        {primaryAction && (
          <EmptyStateActions>
            <Button
              variant="primary"
              icon={primaryAction.icon}
              onClick={primaryAction.onClick}
              isDisabled={primaryAction.isDisabled}
            >
              {primaryAction.label}
            </Button>
          </EmptyStateActions>
        )}
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default AppEmptyState;
