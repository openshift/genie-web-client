import React from 'react';

import { Bullseye, EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

export const EmptyDashboard: React.FC = () => {
  return (
    <Bullseye className="pf-v6-u-h-100">
      <EmptyState titleText="This dashboard is empty" headingLevel="h2" icon={CubesIcon}>
        <EmptyStateBody>
          You can rebuild it by asking Aladdin to generate sections and widgets, or manually add
          what you need using the toolbar.
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};
