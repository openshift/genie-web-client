import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionList,
  ActionListItem,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckIcon,
  EllipsisHIcon,
  SyncAltIcon,
  TimesIcon,
  UndoIcon,
  RedoIcon,
  CalendarAltIcon,
  ClockIcon,
  OpenDrawerRightIcon,
  CatalogIcon,
} from '@patternfly/react-icons';
import './CanvasToolbar.css';

export interface ArtifactOption {
  id: string;
  name: string;
}

export const TIME_RANGE_OPTIONS = [
  'last5min',
  'last15min',
  'last30min',
  'last1hour',
  'last6hours',
  'last24hours',
] as const;
export const REFRESH_INTERVAL_OPTIONS = ['5sec', '10sec', '30sec', '1min', '5min'] as const;

export type CanvasToolbarActionType =
  | 'TOGGLE_CANVAS'
  | 'RENAME'
  | 'OPEN_HISTORY'
  | 'REFRESH'
  | 'TIME_RANGE_CHANGE'
  | 'REFRESH_INTERVAL_CHANGE'
  | 'CLOSE'
  | 'UNDO'
  | 'REDO';

export interface CanvasToolbarAction {
  actionType: CanvasToolbarActionType;
  label: string;
  icon: ReactNode;
}

export interface CanvasToolbarProps {
  /** Canvas title (editable) */
  title: string;
  /** Update handler for canvas title */
  onTitleChange?: (newTitle: string) => void;
  /** Standard action callback (RENAME, OPEN_HISTORY, REFRESH, etc.) */
  onAction: (actionType: CanvasToolbarActionType) => void;
  /** Whether the canvas is expanded (for toggle icon state) */
  isCanvasExpanded?: boolean;
  /** Artifact options for the switcher dropdown */
  artifacts?: ArtifactOption[];
  /** Selected artifact id */
  selectedArtifactId?: string;
  /** Artifact selection handler */
  onArtifactSelect?: (artifactId: string) => void;
  /** Artifact rename handler - called when title is edited for the selected artifact */
  onArtifactRename?: (artifactId: string, newName: string) => void;
  /** Override center actions (for artifact type variations) */
  centerActions?: CanvasToolbarAction[];
  /** Additional items to show in the overflow menu */
  overflowMenuItems?: ReactNode;
  /** Breakpoint width for collapsing actions into overflow */
  collapseAt?: number;
  /** Custom class name for the toolbar */
  className?: string;
  /** Selected time range */
  timeRange?: string;
  /** Time range change handler */
  onTimeRangeChange?: (timeRange: string) => void;
  /** Selected refresh interval */
  refreshInterval?: string;
  /** Refresh interval change handler */
  onRefreshIntervalChange?: (refreshInterval: string) => void;
  /** Whether to show time controls (time range, refresh interval, refresh button) */
  showTimeControls?: boolean;
}

/**
 * CanvasToolbar - A reusable toolbar layout component for the Canvas frame.
 *
 * Provides a three-slot system per AC:
 * - Left Slot: For toggle button, artifact switcher, etc.
 * - Center Slot: For global action buttons (varies by artifact type)
 * - Right Slot: Separator, Overflow menu, and Close button
 *
 * This component is designed to be reusable across different contexts
 * (dashboard artifacts, code snippets, etc.) by accepting flexible content
 * for each slot.
 */
export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  title,
  onTitleChange,
  onAction,
  isCanvasExpanded = true,
  artifacts = [],
  selectedArtifactId,
  onArtifactSelect,
  onArtifactRename,
  centerActions,
  overflowMenuItems,
  collapseAt = 1024,
  className,
  timeRange: controlledTimeRange,
  onTimeRangeChange,
  refreshInterval: controlledRefreshInterval,
  onRefreshIntervalChange,
  showTimeControls = true,
}) => {
  const { t } = useTranslation('plugin__genie-web-client');
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isArtifactSwitcherOpen, setIsArtifactSwitcherOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [isNarrow, setIsNarrow] = useState(false);
  const [internalTimeRange, setInternalTimeRange] = useState('last30min');
  const [internalRefreshInterval, setInternalRefreshInterval] = useState('10sec');
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [isRefreshIntervalOpen, setIsRefreshIntervalOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const currentTimeRange = controlledTimeRange ?? internalTimeRange;
  const currentRefreshInterval = controlledRefreshInterval ?? internalRefreshInterval;

  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  useEffect(() => {
    const hasMultiple = artifacts.length > 1 && onArtifactSelect;
    if (hasMultiple && selectedArtifactId && !isEditingTitle) {
      const selectedArtifact = artifacts.find((artifact) => artifact.id === selectedArtifactId);
      if (selectedArtifact && selectedArtifact.name !== draftTitle) {
        setDraftTitle(selectedArtifact.name);
        onTitleChange?.(selectedArtifact.name);
      }
    }
  }, [selectedArtifactId, artifacts, onArtifactSelect, isEditingTitle, draftTitle, onTitleChange]);

  useEffect(() => {
    if (!toolbarRef.current) {
      return;
    }

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect?.width ?? 0;
        setIsNarrow(width < collapseAt);
      });
      observer.observe(toolbarRef.current);
      return () => observer.disconnect();
    }

    const handleResize = () => setIsNarrow(window.innerWidth < collapseAt);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapseAt]);

  const defaultCenterActions = useMemo<CanvasToolbarAction[]>(
    () => [
      { actionType: 'UNDO', label: 'Undo', icon: <UndoIcon /> },
      { actionType: 'REDO', label: 'Redo', icon: <RedoIcon /> },
    ],
    [],
  );

  const actions = centerActions ?? defaultCenterActions;

  const handleSaveTitle = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      return;
    }
    onTitleChange?.(trimmed);
    if (hasMultipleArtifacts && selectedArtifactId) {
      onArtifactRename?.(selectedArtifactId, trimmed);
    }
    onAction('RENAME');
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setDraftTitle(title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveTitle();
    } else if (event.key === 'Escape') {
      handleCancelTitle();
    }
  };

  const hasMultipleArtifacts = artifacts.length > 1 && onArtifactSelect;

  return (
    <div ref={toolbarRef} className="canvas-toolbar__wrapper">
      <Toolbar className={`canvas-toolbar ${className || ''}`}>
        <ToolbarContent>
          <ToolbarGroup align={{ default: 'alignStart' }} className="canvas-toolbar__left-slot">
            <ToolbarItem>
              <Tooltip
                content={
                  isCanvasExpanded
                    ? t('canvasToolbar.collapseCanvas')
                    : t('canvasToolbar.expandCanvas')
                }
              >
                <Button
                  variant="plain"
                  aria-label={
                    isCanvasExpanded
                      ? t('canvasToolbar.collapseCanvas')
                      : t('canvasToolbar.expandCanvas')
                  }
                  onClick={() => onAction('TOGGLE_CANVAS')}
                  className="canvas-toolbar__toggle-button"
                >
                  <OpenDrawerRightIcon />
                </Button>
              </Tooltip>
            </ToolbarItem>

            <ToolbarItem variant="separator" />

            <ToolbarItem className="canvas-toolbar__title-group">
              {isEditingTitle ? (
                <div className="canvas-toolbar__title-edit">
                  <TextInputGroup className="canvas-toolbar__title-input">
                    <TextInputGroupMain
                      value={draftTitle}
                      onChange={(_event, value) => setDraftTitle(value)}
                      onKeyDown={handleKeyDown}
                      aria-label={t('canvasToolbar.editCanvasTitle')}
                    />
                  </TextInputGroup>
                  <ActionList isIconList>
                    <ActionListItem>
                      <Button
                        variant="plain"
                        aria-label={t('canvasToolbar.saveTitle')}
                        onClick={handleSaveTitle}
                      >
                        <CheckIcon />
                      </Button>
                    </ActionListItem>
                    <ActionListItem>
                      <Button
                        variant="plain"
                        aria-label={t('canvasToolbar.cancelEdit')}
                        onClick={handleCancelTitle}
                      >
                        <TimesIcon />
                      </Button>
                    </ActionListItem>
                  </ActionList>
                </div>
              ) : hasMultipleArtifacts ? (
                <div className="canvas-toolbar__switcher-container">
                  <Tooltip content={draftTitle}>
                    <Button
                      variant="plain"
                      isInline
                      className="canvas-toolbar__title-button"
                      onClick={() => setIsEditingTitle(true)}
                      aria-label={t('canvasToolbar.editCanvasTitle')}
                    >
                      <span className="canvas-toolbar__title-icon">
                        <CatalogIcon />
                      </span>
                      <span className="canvas-toolbar__title-text" title={draftTitle}>
                        {draftTitle}
                      </span>
                    </Button>
                  </Tooltip>
                  <Dropdown
                    isOpen={isArtifactSwitcherOpen}
                    onOpenChange={setIsArtifactSwitcherOpen}
                    toggle={(ref: Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={ref}
                        variant="plainText"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsArtifactSwitcherOpen(!isArtifactSwitcherOpen);
                        }}
                        isExpanded={isArtifactSwitcherOpen}
                        aria-label={t('canvasToolbar.switchArtifact')}
                        className="canvas-toolbar__artifact-dropdown-toggle"
                      />
                    )}
                  >
                    <DropdownList className="canvas-toolbar__artifact-dropdown-list">
                      {artifacts.map((artifact) => (
                        <DropdownItem
                          key={artifact.id}
                          onClick={() => {
                            onArtifactSelect(artifact.id);
                            setIsArtifactSwitcherOpen(false);
                          }}
                          isSelected={artifact.id === selectedArtifactId}
                          className="canvas-toolbar__artifact-dropdown-item"
                        >
                          {/* text only, no icon */}
                          <span className="canvas-toolbar__artifact-dropdown-item-text">
                            {artifact.name}
                          </span>
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  </Dropdown>
                </div>
              ) : (
                <Tooltip content={draftTitle}>
                  <Button
                    variant="plain"
                    isInline
                    className="canvas-toolbar__title-button"
                    onClick={() => setIsEditingTitle(true)}
                    aria-label={t('canvasToolbar.editCanvasTitle')}
                  >
                    <span className="canvas-toolbar__title-icon">
                      <CatalogIcon />
                    </span>
                    <span className="canvas-toolbar__title-text" title={draftTitle}>
                      {draftTitle}
                    </span>
                  </Button>
                </Tooltip>
              )}
            </ToolbarItem>
          </ToolbarGroup>

          {!isNarrow && (
            <>
              <ToolbarItem className="canvas-toolbar__spacer" />
              <ToolbarGroup variant="action-group" className="canvas-toolbar__center-slot">
                <div className="canvas-toolbar__version-history-group">
                  {actions.map((action) => (
                    <ToolbarItem key={action.actionType}>
                      <Tooltip content={action.label}>
                        <Button
                          variant="plain"
                          aria-label={action.label}
                          onClick={() => onAction(action.actionType)}
                          className={`canvas-toolbar__action-button ${
                            action.actionType === 'UNDO'
                              ? 'canvas-toolbar__action-button--undo'
                              : ''
                          }`}
                        >
                          {action.icon}
                        </Button>
                      </Tooltip>
                    </ToolbarItem>
                  ))}
                  <ToolbarItem>
                    <Tooltip content="Previous version">
                      <Button
                        variant="plain"
                        aria-label="Previous version"
                        onClick={() => onAction('OPEN_HISTORY')}
                        className="canvas-toolbar__action-button"
                      >
                        <ClockIcon />
                      </Button>
                    </Tooltip>
                  </ToolbarItem>
                </div>
                {showTimeControls && (
                  <div className="canvas-toolbar__time-controls-group">
                    <ToolbarItem>
                      <Tooltip content={t('canvasToolbar.displayTimeRange')}>
                        <Dropdown
                          isOpen={isTimeRangeOpen}
                          onOpenChange={setIsTimeRangeOpen}
                          toggle={(ref: Ref<MenuToggleElement>) => (
                            <MenuToggle
                              ref={ref}
                              variant="plainText"
                              onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
                              isExpanded={isTimeRangeOpen}
                              aria-label={t('canvasToolbar.selectTimeRange')}
                              className="canvas-toolbar__time-control"
                            >
                              <CalendarAltIcon className="canvas-toolbar__time-icon" />
                              <span className="canvas-toolbar__time-text">
                                {t(`canvasToolbar.timeRange.${currentTimeRange}`)}
                              </span>
                            </MenuToggle>
                          )}
                        >
                          <DropdownList className="canvas-toolbar__time-range-dropdown-list">
                            {TIME_RANGE_OPTIONS.map((option) => (
                              <DropdownItem
                                key={option}
                                onClick={() => {
                                  if (onTimeRangeChange) {
                                    onTimeRangeChange(option);
                                  } else {
                                    setInternalTimeRange(option);
                                  }
                                  setIsTimeRangeOpen(false);
                                  onAction('TIME_RANGE_CHANGE');
                                }}
                                isSelected={option === currentTimeRange}
                              >
                                {t(`canvasToolbar.timeRange.${option}`)}
                              </DropdownItem>
                            ))}
                          </DropdownList>
                        </Dropdown>
                      </Tooltip>
                    </ToolbarItem>

                    {/* refresh interval dropdown */}
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isRefreshIntervalOpen}
                        onOpenChange={setIsRefreshIntervalOpen}
                        toggle={(ref: Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={ref}
                            variant="plainText"
                            onClick={() => setIsRefreshIntervalOpen(!isRefreshIntervalOpen)}
                            isExpanded={isRefreshIntervalOpen}
                            aria-label={t('canvasToolbar.selectRefreshInterval')}
                            className="canvas-toolbar__refresh-interval-control"
                          >
                            <ClockIcon className="canvas-toolbar__time-icon" />
                            <span className="canvas-toolbar__time-text">
                              {t(`canvasToolbar.refreshInterval.${currentRefreshInterval}`)}
                            </span>
                          </MenuToggle>
                        )}
                      >
                        <DropdownList className="canvas-toolbar__refresh-interval-dropdown-list">
                          {REFRESH_INTERVAL_OPTIONS.map((option) => (
                            <DropdownItem
                              key={option}
                              onClick={() => {
                                if (onRefreshIntervalChange) {
                                  onRefreshIntervalChange(option);
                                } else {
                                  setInternalRefreshInterval(option);
                                }
                                setIsRefreshIntervalOpen(false);
                                onAction('REFRESH_INTERVAL_CHANGE');
                              }}
                              isSelected={option === currentRefreshInterval}
                            >
                              {t(`canvasToolbar.refreshInterval.${option}`)}
                            </DropdownItem>
                          ))}
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>
                    <ToolbarItem>
                      <Tooltip content={t('canvasToolbar.refresh')}>
                        <Button
                          variant="plain"
                          aria-label={t('canvasToolbar.refresh')}
                          onClick={() => onAction('REFRESH')}
                          className="canvas-toolbar__refresh-button"
                        >
                          <SyncAltIcon />
                        </Button>
                      </Tooltip>
                    </ToolbarItem>
                  </div>
                )}
              </ToolbarGroup>
            </>
          )}
          <ToolbarGroup align={{ default: 'alignEnd' }} className="canvas-toolbar__right-slot">
            <ToolbarItem variant="separator" />
            <ToolbarItem>
              <Dropdown
                isOpen={isOverflowOpen}
                onOpenChange={setIsOverflowOpen}
                toggle={(ref: Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={ref}
                    variant="plain"
                    onClick={() => setIsOverflowOpen(!isOverflowOpen)}
                    aria-label={t('canvasToolbar.moreOptions')}
                    className="canvas-toolbar__overflow-button"
                  >
                    <EllipsisHIcon />
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  {isNarrow &&
                    actions.map((action) => (
                      <DropdownItem
                        key={action.actionType}
                        icon={action.icon}
                        onClick={() => {
                          onAction(action.actionType);
                          setIsOverflowOpen(false);
                        }}
                      >
                        {action.label}
                      </DropdownItem>
                    ))}
                  {overflowMenuItems}
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <Tooltip content={t('canvasToolbar.close')}>
                <Button
                  variant="plain"
                  aria-label={t('canvasToolbar.close')}
                  onClick={() => onAction('CLOSE')}
                  className="canvas-toolbar__close-button"
                >
                  <TimesIcon />
                </Button>
              </Tooltip>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    </div>
  );
};
