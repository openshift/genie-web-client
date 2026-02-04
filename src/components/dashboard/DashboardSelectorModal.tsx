import React, { useState, useCallback } from 'react';
import {
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  TextInput,
  MenuToggle,
  Select,
  SelectOption,
  SelectList,
  Divider,
  EmptyState,
  EmptyStateBody,
  Spinner,
} from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import type { AladdinDashboard, AladdinDashboardSpec } from '../../types/dashboard';
import { useDashboards, useDashboardActions } from '../../hooks/useDashboard';

export interface DashboardSelectorModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed without selection */
  onClose: () => void;
  /** Callback when a dashboard is selected or created */
  onSelect: (dashboard: AladdinDashboard) => void;
  /** Namespace to list/create dashboards in */
  namespace: string;
}

type ModalMode = 'select' | 'create';

/**
 * Modal for selecting an existing dashboard or creating a new one.
 */
export const DashboardSelectorModal: React.FunctionComponent<DashboardSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  namespace,
}) => {
  const [mode, setMode] = useState<ModalMode>('select');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<AladdinDashboard | null>(null);
  const [newDashboardTitle, setNewDashboardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { dashboards, loaded, error: loadError } = useDashboards({ namespace });
  const { createDashboard } = useDashboardActions(namespace);

  const handleSelectToggle = useCallback(() => {
    setIsSelectOpen((prev) => !prev);
  }, []);

  const handleSelectDashboard = useCallback(
    (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
      const dashboard = dashboards.find((d) => d.metadata?.name === value);
      if (dashboard) {
        setSelectedDashboard(dashboard);
        setIsSelectOpen(false);
      }
    },
    [dashboards],
  );

  const handleConfirmSelection = useCallback(() => {
    if (selectedDashboard) {
      onSelect(selectedDashboard);
      resetState();
    }
  }, [selectedDashboard, onSelect]);

  const handleCreateDashboard = useCallback(async () => {
    if (!newDashboardTitle.trim()) {
      setError('Dashboard title is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Generate a valid K8s name from the title
      const name = newDashboardTitle
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 63);

      const spec: AladdinDashboardSpec = {
        title: newDashboardTitle,
        layout: {
          columns: 12,
          panels: [],
        },
      };

      const dashboard = await createDashboard(name, spec);
      onSelect(dashboard);
      resetState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard');
    } finally {
      setIsCreating(false);
    }
  }, [newDashboardTitle, createDashboard, onSelect]);

  const resetState = useCallback(() => {
    setMode('select');
    setSelectedDashboard(null);
    setNewDashboardTitle('');
    setError(null);
    setIsSelectOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleSwitchToCreate = useCallback(() => {
    setMode('create');
    setSelectedDashboard(null);
    setIsSelectOpen(false);
  }, []);

  const handleSwitchToSelect = useCallback(() => {
    setMode('select');
    setNewDashboardTitle('');
    setError(null);
  }, []);

  const hasDashboards = dashboards.length > 0;

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="dashboard-selector-modal-title"
    >
      <ModalHeader title="Add to Dashboard" labelId="dashboard-selector-modal-title" />
      <ModalBody>
        {!loaded ? (
          <EmptyState>
            <Spinner size="lg" />
            <EmptyStateBody>Loading dashboards...</EmptyStateBody>
          </EmptyState>
        ) : loadError ? (
          <EmptyState>
            <EmptyStateBody>Failed to load dashboards: {loadError.message}</EmptyStateBody>
          </EmptyState>
        ) : mode === 'select' ? (
          <>
            {hasDashboards ? (
              <Form>
                <FormGroup label="Select a dashboard" fieldId="dashboard-select">
                  <Select
                    id="dashboard-select"
                    isOpen={isSelectOpen}
                    selected={selectedDashboard?.metadata?.name}
                    onSelect={handleSelectDashboard}
                    onOpenChange={setIsSelectOpen}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={handleSelectToggle}
                        isExpanded={isSelectOpen}
                        isFullWidth
                      >
                        {selectedDashboard?.spec.title ?? 'Select a dashboard'}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      {dashboards.map((dashboard) => (
                        <SelectOption
                          key={dashboard.metadata?.name}
                          value={dashboard.metadata?.name}
                        >
                          {dashboard.spec.title}
                        </SelectOption>
                      ))}
                    </SelectList>
                  </Select>
                </FormGroup>
                <Divider />
                <Button variant="link" icon={<PlusIcon />} onClick={handleSwitchToCreate}>
                  Create new dashboard
                </Button>
              </Form>
            ) : (
              <EmptyState>
                <EmptyStateBody>
                  No dashboards found. Create a new dashboard to add this widget.
                </EmptyStateBody>
                <Button variant="primary" icon={<PlusIcon />} onClick={handleSwitchToCreate}>
                  Create dashboard
                </Button>
              </EmptyState>
            )}
          </>
        ) : (
          <Form>
            <FormGroup label="Dashboard title" fieldId="new-dashboard-title" isRequired>
              <TextInput
                id="new-dashboard-title"
                value={newDashboardTitle}
                onChange={(_event, value) => setNewDashboardTitle(value)}
                placeholder="Enter dashboard title"
                validated={error ? 'error' : 'default'}
                isRequired
              />
              {error ? (
                <p style={{ color: 'var(--pf-v5-global--danger-color--100)', marginTop: '4px' }}>
                  {error}
                </p>
              ) : null}
            </FormGroup>
            {hasDashboards ? (
              <Button variant="link" onClick={handleSwitchToSelect}>
                Select existing dashboard instead
              </Button>
            ) : null}
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="link" onClick={handleClose}>
          Cancel
        </Button>
        {mode === 'select' ? (
          <Button
            variant="primary"
            onClick={handleConfirmSelection}
            isDisabled={!selectedDashboard}
          >
            Add to dashboard
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleCreateDashboard}
            isLoading={isCreating}
            isDisabled={isCreating || !newDashboardTitle.trim()}
          >
            Create and add
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
