import { useState, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import type { AladdinDashboard } from '../types/dashboard';

export type CanvasState = 'open' | 'closed' | 'maximized';

/**
 * Active artifact displayed in the canvas.
 * Currently only AladdinDashboard is supported; expand this union for future artifact types.
 * Use the K8s `kind` field to discriminate between types.
 */
export type ActiveArtifact = AladdinDashboard | null;

export interface ChatConversationContextValue {
  // Canvas state - region for rendering artifacts from conversation
  canvasState: CanvasState;
  isCanvasOpen: boolean;
  openCanvas: () => void;
  closeCanvas: () => void;
  maximizeCanvas: () => void;
  setCanvasState: (state: CanvasState) => void;

  // Active artifact displayed in canvas
  activeArtifact: ActiveArtifact;
  setActiveArtifact: (artifact: ActiveArtifact) => void;
  clearActiveArtifact: () => void;

  // Create mode - auto-create dashboard when widgets are created
  isCreateModeEnabled: boolean;
  enableCreateMode: () => void;
  disableCreateMode: () => void;
  toggleCreateMode: () => void;
}

/**
 * Context for sharing chat conversation state with nested components.
 * Avoids prop drilling for ArtifactRenderer and other nested components.
 */
const ChatConversationContext = createContext<ChatConversationContextValue | undefined>(undefined);

/**
 * Hook to access chat conversation context.
 * Must be used within a ChatConversationProvider.
 */
export function useChatConversationContext(): ChatConversationContextValue {
  const context = useContext(ChatConversationContext);
  if (context === undefined) {
    throw new Error('useChatConversationContext must be used within a ChatConversationProvider');
  }
  return context;
}

/**
 * Hook to manage chat conversation UI state including canvas visibility,
 * active artifact, and create mode for auto-creating dashboards.
 */
export function useChatConversation(): ChatConversationContextValue {
  // Canvas state - region for rendering artifacts from conversation
  const [canvasState, setCanvasState] = useState<CanvasState>('closed');

  // Active artifact displayed in canvas
  const [activeArtifact, setActiveArtifactState] = useState<ActiveArtifact>(null);

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

  // Active artifact actions
  const setActiveArtifact = useCallback((artifact: ActiveArtifact) => {
    setActiveArtifactState(artifact);
  }, []);

  const clearActiveArtifact = useCallback(() => {
    setActiveArtifactState(null);
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
      activeArtifact,
      setActiveArtifact,
      clearActiveArtifact,
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
      activeArtifact,
      setActiveArtifact,
      clearActiveArtifact,
      isCreateModeEnabled,
      enableCreateMode,
      disableCreateMode,
      toggleCreateMode,
    ],
  );
}

interface ChatConversationProviderProps {
  children: ReactNode;
}

/**
 * Provider component for chat conversation context.
 * Wrap this around components that need access to canvas and artifact state.
 */
export function ChatConversationProvider({ children }: ChatConversationProviderProps): JSX.Element {
  const value = useChatConversation();
  return (
    <ChatConversationContext.Provider value={value}>{children}</ChatConversationContext.Provider>
  );
}
