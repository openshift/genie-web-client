import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';
import {
  useActiveConversation,
  useSetActiveConversation,
  useConversations,
  useCreateNewConversation,
} from './AIState';
import { useUpdateConversationTitle } from './AIState/useUpdateConversationTitle';
import type { Conversation } from './AIState/types';

export type CanvasState = 'open' | 'closed' | 'maximized';

interface TitleEditState {
  isEditing: boolean;
  editValue: string;
  validationError: string | undefined;
  apiError: string | null;
  isUpdating: boolean;
}

interface UseChatConversationResult {
  // Active conversation state
  activeConversation: Conversation | undefined;
  conversationId: string | undefined;
  conversations: Conversation[];

  // Loading and validation state
  isLoading: boolean;
  isValidConversationId: boolean;

  // Title editing state and actions
  title: string;
  titleEditState: TitleEditState;
  startEditingTitle: () => void;
  cancelEditingTitle: () => void;
  updateTitleValue: (value: string) => void;
  saveTitle: () => Promise<void>;

  // Conversation actions
  setActiveConversation: (conversationId: string) => Promise<void>;
  createNewConversation: () => Promise<Conversation>;
  navigateToConversation: (conversationId: string) => void;

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
 * Hook to manage chat conversation state including active conversation,
 * title editing, and navigation
 */
export function useChatConversation(): UseChatConversationResult {
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams<{ conversationId: string }>();

  // Core conversation hooks
  const activeConversation = useActiveConversation();
  const setActiveConversationBase = useSetActiveConversation();
  const conversations = useConversations();
  const createNewConversationBase = useCreateNewConversation();
  const { updateTitle, isUpdating, error: apiError, clearError } = useUpdateConversationTitle();

  // Loading and validation state
  const [isLoading, setIsLoading] = useState(false);
  const [isValidConversationId, setIsValidConversationId] = useState(true);

  // Canvas state - region for rendering artifacts from conversation
  const [canvasState, setCanvasState] = useState<CanvasState>('closed');

  // Create mode - auto-create dashboard when widgets are created
  const [isCreateModeEnabled, setIsCreateModeEnabled] = useState(false);

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleEditValue, setTitleEditValue] = useState<string>('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [localError, setLocalError] = useState<string | null>(null);
  const originalTitleRef = useRef<string>('');

  const conversationId = activeConversation?.id;
  const title = activeConversation?.title ?? '';

  // Sync title edit value with active conversation when not editing
  useEffect(() => {
    if (!isEditingTitle && activeConversation?.title) {
      setTitleEditValue(activeConversation.title);
    }
  }, [activeConversation?.title, isEditingTitle]);

  // Handle URL-based conversation loading
  useEffect(() => {
    if (urlConversationId && activeConversation?.id !== urlConversationId) {
      const loadConversation = async () => {
        setIsLoading(true);
        try {
          await setActiveConversationBase(urlConversationId);
          setIsValidConversationId(true);
        } catch {
          setIsValidConversationId(false);
        } finally {
          setIsLoading(false);
        }
      };

      loadConversation();
    }
  }, [urlConversationId, activeConversation?.id, setActiveConversationBase]);

  // Sync URL with active conversation
  useEffect(() => {
    if (!urlConversationId && activeConversation?.id && !activeConversation.id.includes('__temp')) {
      navigate(`/genie/chat/${activeConversation.id}`, { replace: true });
    }
  }, [urlConversationId, activeConversation, navigate]);

  const startEditingTitle = useCallback(() => {
    originalTitleRef.current = titleEditValue;
    setIsEditingTitle(true);
    clearError();
    setLocalError(null);
  }, [titleEditValue, clearError]);

  const cancelEditingTitle = useCallback(() => {
    setIsEditingTitle(false);
    setTitleEditValue(originalTitleRef.current);
    setValidationError(undefined);
    clearError();
    setLocalError(null);
  }, [clearError]);

  const updateTitleValue = useCallback(
    (value: string) => {
      setTitleEditValue(value);
      if (validationError && value.trim()) {
        setValidationError(undefined);
      }
      if (apiError) {
        clearError();
      }
      if (localError) {
        setLocalError(null);
      }
    },
    [validationError, apiError, localError, clearError],
  );

  const saveTitle = useCallback(async () => {
    const trimmedTitle = titleEditValue.trim();
    if (!trimmedTitle) {
      setValidationError('Title cannot be empty');
      return;
    }

    if (!conversationId) {
      setLocalError('No active conversation');
      return;
    }

    try {
      await updateTitle(conversationId, trimmedTitle);
      setIsEditingTitle(false);
      setValidationError(undefined);
      setLocalError(null);
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  }, [titleEditValue, conversationId, updateTitle]);

  const setActiveConversation = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await setActiveConversationBase(id);
        setIsValidConversationId(true);
      } catch {
        setIsValidConversationId(false);
        throw new Error('Failed to set active conversation');
      } finally {
        setIsLoading(false);
      }
    },
    [setActiveConversationBase],
  );

  const createNewConversation = useCallback(() => {
    return createNewConversationBase();
  }, [createNewConversationBase]);

  const navigateToConversation = useCallback(
    (id: string) => {
      navigate(`/genie/chat/${id}`);
    },
    [navigate],
  );

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

  const titleEditState: TitleEditState = useMemo(
    () => ({
      isEditing: isEditingTitle,
      editValue: titleEditValue,
      validationError,
      apiError: apiError || localError,
      isUpdating,
    }),
    [isEditingTitle, titleEditValue, validationError, apiError, localError, isUpdating],
  );

  return useMemo(
    () => ({
      activeConversation,
      conversationId,
      conversations,
      isLoading,
      isValidConversationId,
      title,
      titleEditState,
      startEditingTitle,
      cancelEditingTitle,
      updateTitleValue,
      saveTitle,
      setActiveConversation,
      createNewConversation,
      navigateToConversation,
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
      activeConversation,
      conversationId,
      conversations,
      isLoading,
      isValidConversationId,
      title,
      titleEditState,
      startEditingTitle,
      cancelEditingTitle,
      updateTitleValue,
      saveTitle,
      setActiveConversation,
      createNewConversation,
      navigateToConversation,
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
