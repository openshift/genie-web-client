/* eslint-disable */
const React = require('react');

// Export mock functions for MessageBox ref methods so tests can spy on them
const mockScrollToBottom = jest.fn();
const mockScrollToTop = jest.fn();
const mockIsSmartScrollActive = jest.fn(() => true);

const MessageBar = React.forwardRef((props, ref) => {
  const { onSendMessage, ...restProps } = props;
  const [message, setMessage] = React.useState('');

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return React.createElement('div', { 'data-test': 'mock-message-bar', ...restProps },
    React.createElement('textarea', {
      ref: ref,
      'aria-label': 'Send a message...',
      value: message,
      onChange: (e) => setMessage(e.target.value),
    }),
    React.createElement('button', {
      'aria-label': 'Send',
      onClick: handleSend,
    }, 'Send')
  );
});

MessageBar.displayName = 'MessageBar';

const Chatbot = ({ children, displayMode, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot', 'data-display-mode': displayMode, ...props }, children);
};

const ChatbotContent = ({ children, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot-content', ...props }, children);
};

const MessageBox = React.forwardRef(({ children, enableSmartScroll, ...props }, ref) => {
  // Mock implementation of MessageBox ref methods
  React.useImperativeHandle(ref, () => ({
    scrollToBottom: mockScrollToBottom,
    scrollToTop: mockScrollToTop,
    isSmartScrollActive: mockIsSmartScrollActive,
  }), []);

  return React.createElement('div', { 
    'data-testid': 'message-box', 
    'data-enable-smart-scroll': enableSmartScroll,
    ...props 
  }, children);
});

MessageBox.displayName = 'MessageBox';

const Message = ({ children, name, role, content, isLoading, timestamp, actions, ...props }) => {
  // render action buttons if provided
  const actionButtons = actions ? Object.entries(actions).map(([key, action]) => {
    return React.createElement('button', {
      key: key,
      'aria-label': action.ariaLabel || action.tooltipContent,
      'data-action': key,
      'data-is-clicked': action.isClicked || false,
      onClick: action.onClick,
    }, action.icon);
  }) : null;

  return React.createElement('div', {
    'data-testid': 'message',
    'data-role': role,
    'data-name': name,
    'data-is-loading': isLoading,
    'data-timestamp': timestamp,
    actions: actions,
    ...props,
  }, content || children, actionButtons);
};

// Header pieces used by Chat.tsx
const ChatbotHeader = ({ children, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot-header', ...props }, children);
};
const ChatbotHeaderMain = ({ children, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot-header-main', ...props }, children);
};
const ChatbotHeaderTitle = ({ children, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot-header-title', ...props }, children);
};
const ChatbotHeaderActions = ({ children, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot-header-actions', ...props }, children);
};
const ChatbotHeaderOptionsDropdown = ({ children, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot-header-options', ...props }, children);
};

const ChatbotFooter = ({ children, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot-footer', ...props }, children);
};

const ChatbotDisplayMode = {
  embedded: 'embedded',
  overlay: 'overlay',
  inline: 'inline',
};

module.exports = {
  MessageBar,
  Chatbot,
  ChatbotHeader,
  ChatbotHeaderMain,
  ChatbotHeaderTitle,
  ChatbotHeaderActions,
  ChatbotHeaderOptionsDropdown,
  ChatbotContent,
  ChatbotFooter,
  MessageBox,
  Message,
  ChatbotDisplayMode,
  // Export mock functions for testing
  mockScrollToBottom,
  mockScrollToTop,
  mockIsSmartScrollActive,
};