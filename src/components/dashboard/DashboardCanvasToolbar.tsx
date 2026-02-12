import React, { useState, useCallback } from 'react';
import { Button } from '@patternfly/react-core';
import { CanvasToolbar } from '../canvas';
import { useActiveDashboard } from '../../hooks/useActiveDashboard';

export interface DashboardCanvasToolbarProps {
  /** Namespace for dashboard operations */
  namespace?: string;
}

/**
 * Renders the canvas toolbar with save button for unsaved dashboards.
 */
export const DashboardCanvasToolbar: React.FunctionComponent<DashboardCanvasToolbarProps> = ({
  namespace = 'default',
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { saveDashboard, hasActiveDashboard, isDashboardSaved } = useActiveDashboard(namespace);

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
