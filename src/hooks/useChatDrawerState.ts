import { useCallback, useState } from 'react';

const CHAT_SPLIT_SCREEN = 'genie-split-screen';

export interface ChatDrawerState {
  active: boolean;
  width?: number;
}

const getDrawerStateFromStorage = (): ChatDrawerState => {
  try {
    const drawerLocalState = localStorage.getItem(CHAT_SPLIT_SCREEN);
    if (drawerLocalState) {
      return JSON.parse(drawerLocalState);
    }
  } catch (error) {
    console.error('Error reading drawer state from localStorage:', error);
  }
  return { active: false };
};

const saveDrawerStateToStorage = (state: ChatDrawerState): void => {
  try {
    localStorage.setItem(CHAT_SPLIT_SCREEN, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving drawer state to localStorage:', error);
  }
};

export const useChatDrawerState = (): [
  ChatDrawerState,
  (state: ChatDrawerState | ((prevState: ChatDrawerState) => ChatDrawerState)) => void,
] => {
  const [drawerState, setDrawerState] = useState<ChatDrawerState>(getDrawerStateFromStorage);

  const setDrawerStateWithStorage = useCallback(
    (state: ChatDrawerState | ((prevState: ChatDrawerState) => ChatDrawerState)) => {
      setDrawerState((prevState) => {
        const newState = typeof state === 'function' ? state(prevState) : state;
        saveDrawerStateToStorage(newState);
        return newState;
      });
    },
    [],
  );

  return [drawerState, setDrawerStateWithStorage];
};
