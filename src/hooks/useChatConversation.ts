import { useState, useCallback, useMemo } from 'react';

export type CanvasState = 'open' | 'closed' | 'maximized';

interface UseChatConversationResult {
  // Canvas state - region for rendering artifacts from conversation
  canvasState: CanvasState;
  isCanvasOpen: boolean;
  openCanvas: () => void;
  closeCanvas: () => void;
  maximizeCanvas: () => void;
  setCanvasState: (state: CanvasState) => void;

  // Create mode - auto-create dashboard when widgets are created
  isCreateModeEnabled: boolean;
  enableCreateMode: () => void;
  disableCreateMode: () => void;
  toggleCreateMode: () => void;
}

/**
 * Hook to manage chat conversation UI state including canvas visibility
 * and create mode for auto-creating dashboards
 */
export function useChatConversation(): UseChatConversationResult {
  // Canvas state - region for rendering artifacts from conversation
  const [canvasState, setCanvasState] = useState<CanvasState>('closed');

  // Create mode - auto-create dashboard when widgets are created
  const [isCreateModeEnabled, setIsCreateModeEnabled] = useState(false);

  // Canvas actions
  const isCanvasOpen = canvasState !== 'closed';

  const openCanvas = useCallback(() => {
    setCanvasState('open');
  }, []);

  const closeCanvas = useCallback(() => {
    setCanvasState('closed');
  }, []);

  const maximizeCanvas = useCallback(() => {
    setCanvasState('maximized');
  }, []);

  // Create mode actions
  const enableCreateMode = useCallback(() => {
    setIsCreateModeEnabled(true);
  }, []);

  const disableCreateMode = useCallback(() => {
    setIsCreateModeEnabled(false);
  }, []);

  const toggleCreateMode = useCallback(() => {
    setIsCreateModeEnabled((prev) => !prev);
  }, []);

  return useMemo(
    () => ({
      canvasState,
      isCanvasOpen,
      openCanvas,
      closeCanvas,
      maximizeCanvas,
      setCanvasState,
      isCreateModeEnabled,
      enableCreateMode,
      disableCreateMode,
      toggleCreateMode,
    }),
    [
      canvasState,
      isCanvasOpen,
      openCanvas,
      closeCanvas,
      maximizeCanvas,
      isCreateModeEnabled,
      enableCreateMode,
      disableCreateMode,
      toggleCreateMode,
    ],
  );
}
