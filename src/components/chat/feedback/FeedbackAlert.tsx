import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';

interface FeedbackAlertProps {
  variant: AlertVariant;
  title: string;
  children?: ReactNode;
}

export const FeedbackAlert = forwardRef<HTMLDivElement, FeedbackAlertProps>(
  ({ variant, title, children }, ref) => {
    return (
      <div ref={ref} tabIndex={-1}>
        <Alert variant={variant} isInline title={title} className="pf-v6-u-mb-lg" role="alert">
          {children}
        </Alert>
      </div>
    );
  },
);

FeedbackAlert.displayName = 'FeedbackAlert';
