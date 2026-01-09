import { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatBarContextValue {
  showChatBar: boolean;
  setShowChatBar: (showChatBar: boolean) => void;
}

const ChatBarContext = createContext<ChatBarContextValue | undefined>(undefined);

export const ChatBarProvider = ({ children }: { children: ReactNode }) => {
  const [showChatBar, setShowChatBar] = useState(false);
  return (
    <ChatBarContext.Provider value={{ showChatBar, setShowChatBar }}>
      {children}
    </ChatBarContext.Provider>
  );
};

export const useChatBar = (): ChatBarContextValue => {
  const context = useContext(ChatBarContext);
  if (!context) {
    throw new Error('useChatBar must be used within a ChatBarProvider');
  }
  return context;
};
