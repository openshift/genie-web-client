import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

export interface ChatBarContextValue {
  showChatBar: boolean;
  setShowChatBar: (showChatBar: boolean) => void;
}

const ChatBarContext = createContext<ChatBarContextValue | undefined>(undefined);

export const ChatBarProvider = ({ children }: { children: ReactNode }) => {
  const [showChatBar, setShowChatBarState] = useState(true);

  const setShowChatBar = useCallback((value: boolean) => {
    setShowChatBarState(value);
  }, []);

  const contextValue = useMemo(
    () => ({ showChatBar, setShowChatBar }),
    [showChatBar, setShowChatBar],
  );

  return <ChatBarContext.Provider value={contextValue}>{children}</ChatBarContext.Provider>;
};

export const useChatBar = (): ChatBarContextValue => {
  const context = useContext(ChatBarContext);
  if (!context) {
    throw new Error('useChatBar must be used within a ChatBarProvider');
  }
  return context;
};
