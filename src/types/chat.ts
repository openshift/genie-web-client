// Exploring types based on designs
export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  archivedAt: Date | null;
  deletedAt: Date | null;
  messages: Message[];
}

// useConversation hook
export interface ConversationState {
  isLoading: boolean;
  hasError: boolean;
  error: Error | null;
  createMode: boolean;

  // actions
  retry(): Promise<void>;
  rename(title: string): Promise<void>;
  share(): Promise<void>;
  archive(): Promise<void>;
  delete(): Promise<void>;
  undo(action: 'archive' | 'delete' | 'rename'): Promise<void>;
}

// useChat hook
export interface ChatState {
  messages: Message[];
  isReasoning: boolean;
  reasoning: string; 

  sendMessage(message: string): Promise<void>;
}

export interface BaseMessage {
    id: string;
    content: string;
    createdAt: Date;
}

export interface UserMessage extends BaseMessage {
  type: 'user';
}

export interface AIMessage extends BaseMessage {
  type: 'bot';
  artifacts: BaseArtifact[];
  // tools: Tool[];
  // sources: Source[];
}

export type Message = UserMessage | AIMessage;

export interface BaseArtifact {
  id: string;
  createdAt: Date;
}

export interface DashboardArtifact extends BaseArtifact {
  type: 'dashboard';
  widgets: Widget[];
}

export interface BaseWidget {
  id: string;
  title?: string;
  createdAt: Date;
}

export interface NGUIWidget extends BaseWidget {
  type: 'ngui';
  spec: Record<string, unknown>;
}

export type Widget = NGUIWidget;

// Scenario where widget is created as a separate artifact and rendered in chat
export interface WidgetArtifact extends BaseArtifact {
  type: 'widget';
  widget: Widget;
}

export interface CodeArtifact extends BaseArtifact {
  type: 'code';
}

export type Artifact = DashboardArtifact | WidgetArtifact | CodeArtifact;
