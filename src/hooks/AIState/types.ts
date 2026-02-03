export type { Conversation, Message } from '@redhat-cloud-services/ai-client-state';

/** Client shape used by hooks that call conversations API (e.g. useDeleteConversation, useUpdateConversationTitle) */
export type ClientWithFetch = {
  baseUrl?: string;
  fetchFunction?: typeof fetch;
};

export type {
  ClientInitLimitation,
  HandleChunkCallback,
  IAIClient,
  IConversation,
  IConversationMessage,
  IInitErrorResponse,
  IMessageResponse,
  ISimpleStreamingHandler,
  IStreamChunk,
} from '@redhat-cloud-services/ai-client-common';

export type {
  FeedbackCategory as FeedbackCategoryType,
  FeedbackRequest,
  LightSpeedCoreAdditionalProperties,
  LightspeedSendMessageOptions,
  LLMRequest,
  LLMResponse,
  StreamingEvent,
  ToolCallEvent,
  ToolResultEvent,
  ReferencedDocument,
} from '@redhat-cloud-services/lightspeed-client';

// Runtime exports
export {
  isAssistantAnswerEvent,
  isEndEvent,
  isErrorEvent,
  isStartEvent,
  isTokenEvent,
  isToolCallEvent,
  LightspeedClient,
  LightspeedClientError,
  LightspeedValidationError,
} from '@redhat-cloud-services/lightspeed-client';

export { createClientStateManager } from '@redhat-cloud-services/ai-client-state';

export { AIStateProvider } from '@redhat-cloud-services/ai-react-state';
