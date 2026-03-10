import React, { useState, useCallback } from 'react';
import { Button } from '@patternfly/react-core';
import { CanvasToolbar } from '../canvas';
import { useActiveDashboard } from '../../hooks/useActiveDashboard';

import { DEFAULT_DASHBOARD_NAMESPACE } from '../../types/dashboard';

/**
 * Renders the canvas toolbar with save button for unsaved dashboards.
 */
export const DashboardCanvasToolbar: React.FunctionComponent = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { saveDashboard, hasActiveDashboard, isDashboardSaved } = useActiveDashboard(
    DEFAULT_DASHBOARD_NAMESPACE,
    undefined,
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveDashboard();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save dashboard');
      console.error('[DashboardCanvasToolbar] Failed to save dashboard:', error);
    } finally {
      setIsSaving(false);
    }
  }, [saveDashboard]);

  // Only show toolbar when there's an active dashboard
  if (!hasActiveDashboard) {
    return null;
  }

  return (
    <CanvasToolbar
      right={
        <>
          {saveError ? (
            <span style={{ color: 'var(--pf-v5-global--danger-color--100)', marginRight: '8px' }}>
              {saveError}
            </span>
          ) : null}
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={isSaving || isDashboardSaved}
          >
            {isDashboardSaved ? 'Saved' : 'Save'}
          </Button>
        </>
      }
    />
  );
};
