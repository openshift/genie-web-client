// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import * as fs from 'fs';
import * as path from 'path';

expect.extend(toHaveNoViolations);

// mock window.matchMedia for theme tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock aiStateManager to prevent real API calls during tests
// This prevents the "fetch is not defined" error when the state manager tries to initialize
jest.mock('./components/utils/aiStateManager', () => {
  const mockStateManager = {
    init: jest.fn().mockResolvedValue(undefined),
    getState: jest.fn().mockReturnValue({
      conversations: {},
      activeConversationId: null,
      messages: [],
      isInitializing: false,
    }),
    notifyAll: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  };

  return {
    stateManager: mockStateManager,
  };
});

// Load real translations from the JSON file for use in tests
// Resolve path relative to project root (where jest.config.js is located)
const translationsPath = path.resolve(process.cwd(), 'locales/en/plugin__genie-web-client.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8')) as Record<
  string,
  string
>;

// Mock react-i18next with real translations from the JSON file
// This provides i18n support to all tests without needing to mock in each test file
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      let translation = translations[key] || key;

      // Handle interpolation (e.g., {{name}} or {{searchTerm}})
      if (options) {
        Object.entries(options).forEach(([paramKey, paramValue]) => {
          translation = translation.replace(
            new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'),
            String(paramValue),
          );
        });
      }

      return translation;
    },
  }),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
} as never;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  constructor(_callback: ResizeObserverCallback) {}
} as never;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
