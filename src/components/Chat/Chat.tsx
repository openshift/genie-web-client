import React, { useEffect } from 'react';
import { useMessages, useStreamChunk } from '@redhat-cloud-services/ai-react-state';
import {
  Chatbot,
  ChatbotContent,
  MessageBox,
  Message,
  ChatbotDisplayMode,
} from '@patternfly/chatbot';
import { LightSpeedCoreAdditionalProperties, ToolResultEvent } from '@redhat-cloud-services/lightspeed-client';
import DynamicComponent from '@rhngui/patternfly-react-renderer';

function isGenerateUIEvent(token: any) {
  return token?.tool_name?.startsWith?.('generate_ui') && token?.response;
}

function parseGenerateUIResponse(response: string) {
  const parsedResponse = JSON.parse(response);
  console.log('Response:', parsedResponse);
  parsedResponse?.blocks?.map((block: any) => {
    console.log('Block:', block);
    const component = JSON.parse(block.rendering.content);
    console.log('Component:', component);
    return {
      id: block.id,
      type: component.type,
      title: component.title,
      content: component.content,
    }
  }).map((componentConfig: any) => {
    return <DynamicComponent key={componentConfig.id} config={componentConfig.content} />;
  });

}

function handleToolResult(toolResult: ToolResultEvent) {
  const token = toolResult.data?.token as any;
  if (isGenerateUIEvent(token)) {
    console.log(`Parsing ${token?.tool_name} tool result event`);
    parseGenerateUIResponse(token?.response);
  }
}

export const Chat: React.FunctionComponent = () => {
  const bottomRef = React.createRef<HTMLDivElement>();
  const messages = useMessages();
  const streamChunk = useStreamChunk<LightSpeedCoreAdditionalProperties>();

  useEffect(() => {
    streamChunk?.additionalAttributes?.toolResults?.forEach(handleToolResult);
  }, [streamChunk]);

  // Convert Red Hat Cloud Services messages to PatternFly format
  const formatMessages = () => {
    return messages.map((msg) => {
      const message = msg as any; // Type assertion for Red Hat Cloud Services message format
      const isBot = message.role === 'bot';
      let content = message.answer || message.query || message.message || message.content || '';
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
