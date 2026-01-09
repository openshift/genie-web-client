import { useEffect, useRef } from 'react';

interface DrawerState {
  isOpen: boolean;
}

interface UseDrawerFocusManagementProps {
  drawerState: DrawerState;
  closeDrawer: () => void;
}

const DRAWER_FOCUS_DELAY_MS = 100;
const FOCUS_RESTORE_DELAY_MS = 150;

const DRAWER_CONFIG_ARIA_LABELS: Record<string, string> = {
  chatHistory: 'Chat History',
  notifications: 'Notifications',
  activity: 'Activity',
  help: 'Help',
};

/**
 * Custom hook to manage drawer focus behavior:
 * - Focuses close button when drawer opens
 * - Handles Escape key to close drawer
 * - Restores focus to trigger element when drawer closes
 */
interface UseDrawerFocusManagementReturn {
  storeTriggerElement: (configKey: string) => void;
}

export const useDrawerFocusManagement = ({
  drawerState,
  closeDrawer,
}: UseDrawerFocusManagementProps): UseDrawerFocusManagementReturn => {
  const drawerTriggerRef = useRef<HTMLElement | null>(null);
  const drawerConfigKeyRef = useRef<string | null>(null);

  // Focus the close button when drawer opens
  useEffect(() => {
    if (!drawerState.isOpen) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const drawerHead = document.querySelector(
        '.pf-v6-c-drawer__head, [class*="drawer-head"], [class*="DrawerHead"]',
      );
      if (drawerHead) {
        const closeButton = drawerHead.querySelector(
          'button:not([disabled])',
        ) as HTMLButtonElement | null;
        closeButton?.focus();
      }
    }, DRAWER_FOCUS_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [drawerState.isOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    if (!drawerState.isOpen) {
      return;
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [drawerState.isOpen, closeDrawer]);

  // Restore focus to the element that opened the drawer when it closes
  useEffect(() => {
    if (!drawerState.isOpen && (drawerTriggerRef.current || drawerConfigKeyRef.current)) {
      const timeoutId = setTimeout(() => {
        let elementToFocus: HTMLElement | null = null;

        // Try stored element reference first
        if (drawerTriggerRef.current && document.contains(drawerTriggerRef.current)) {
          elementToFocus = drawerTriggerRef.current;
        } else if (drawerConfigKeyRef.current) {
          // Fallback: find button by aria-label
          const ariaLabel = DRAWER_CONFIG_ARIA_LABELS[drawerConfigKeyRef.current];
          if (ariaLabel) {
            const button = document.querySelector(
              `button[aria-label="${ariaLabel}"], [aria-label="${ariaLabel}"]`,
            ) as HTMLElement | null;
            if (button) {
              elementToFocus = button;
            }
          }
        }

        if (elementToFocus) {
          try {
            elementToFocus.focus();
          } catch (error) {
            console.warn('Could not restore focus to trigger element:', error);
          }
        }

        // Clear refs
        drawerTriggerRef.current = null;
        drawerConfigKeyRef.current = null;
      }, FOCUS_RESTORE_DELAY_MS);

      return () => clearTimeout(timeoutId);
    }
  }, [drawerState.isOpen]);

  const storeTriggerElement = (configKey: string) => {
    drawerTriggerRef.current = document.activeElement as HTMLElement;
    drawerConfigKeyRef.current = configKey;
  };

  return { storeTriggerElement };
};
