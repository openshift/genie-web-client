const React = require('react');

// CompassPanel mock (from @patternfly/react-core - not yet exported publicly)
const CompassPanel = ({ children, className, isFullHeight, ...props }) => {
  return React.createElement(
    'div',
    {
      className: `pf-v6-c-compass-panel ${className || ''} ${isFullHeight ? 'pf-m-full-height' : ''}`.trim(),
      'data-testid': 'compass-panel',
      ...props,
    },
    children
  );
};

const MessageBar = React.forwardRef((props, ref) => {
  return React.createElement('div', { 'data-test': 'mock-message-bar', ref });
});

const Chatbot = ({ children, displayMode, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot', 'data-display-mode': displayMode, ...props }, children);
};

const ChatbotContent = ({ children, ...props }) => {
  return React.createElement('div', { 'data-testid': 'chatbot-content', ...props }, children);
};

const MessageBox = ({ children, ...props }) => {
  return React.createElement('div', { 'data-testid': 'message-box', ...props }, children);
};

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
  CompassPanel,
};