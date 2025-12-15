import React, { createContext, useContext, useState } from 'react';

const ChatBarContext = createContext<{
  showChatBar: boolean;
  setShowChatBar: (showChatBar: boolean) => void;
}>({
  showChatBar: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setShowChatBar: () => {},
});

export const ChatBarProvider = ({ children }: { children: React.ReactNode }) => {
  const [showChatBar, setShowChatBar] = useState(false);
  return (
    <ChatBarContext.Provider value={{ showChatBar, setShowChatBar }}>
      {children}
    </ChatBarContext.Provider>
  );
};

export const useChatBar = () => {
  return useContext(ChatBarContext);
};
