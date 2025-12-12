import React from 'react';
import { useMessages } from '@redhat-cloud-services/ai-react-state';
import {
  Chatbot,
  ChatbotContent,
  MessageBox,
  Message,
  ChatbotDisplayMode,
} from '@patternfly/chatbot';

export const Chat: React.FunctionComponent = () => {
  const bottomRef = React.createRef<HTMLDivElement>();
  const messages = useMessages();

  // Convert Red Hat Cloud Services messages to PatternFly format
  const formatMessages = () => {
    return messages.map((msg) => {
      const message = msg as any; // Type assertion for Red Hat Cloud Services message format
      const isBot = message.role === 'bot';
      let content = message.answer || message.query || message.message || message.content || '';
      console.log('content', content);
      content = content.split('=====The following is the user query that was asked:').pop();
      return (
        <Message
          key={msg.id}
          isLoading={!content}
          name={isBot ? 'Genie' : 'You'}
          isPrimary={!isBot}
          role={isBot ? 'bot' : 'user'}
          timestamp={new Date(
            message.timestamp || message.createdAt || Date.now(),
          ).toLocaleTimeString()}
          content={content}
        />
      );
    });
  };

  return (
    <Chatbot displayMode={ChatbotDisplayMode.embedded}>
      <ChatbotContent>
        <MessageBox>
          {formatMessages()}
          <div ref={bottomRef}></div>
        </MessageBox>
      </ChatbotContent>
    </Chatbot>
  );
};
