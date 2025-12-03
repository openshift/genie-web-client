const React = require('react');

const MessageBar = React.forwardRef((props, ref) => {
  return React.createElement('div', { 'data-test': 'mock-message-bar', ref });
});

module.exports = { MessageBar };