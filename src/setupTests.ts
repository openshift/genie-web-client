// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import * as fs from 'fs';
import * as path from 'path';

expect.extend(toHaveNoViolations);

/* *************** SUPPRESSING CONSOLE WARNINGS *************** */
// Suppress specific console warnings/errors that we can't control
// Add patterns here to filter out unwanted console output during tests
const SUPPRESSED_WARNINGS = [
  // PatternFly components pass invalid props to DOM elements (bug in PatternFly library)
  /Warning: React does not recognize the `.+` prop on a DOM element/,

  // Expected errors from tests that deliberately trigger error conditions
  /Failed to fetch artifacts: Error: boom/,

  // PatternFly Popper component uses setTimeout for positioning, which fires during test cleanup
  /Warning: An update to Popper inside a test was not wrapped in act/,
];

const DEBUG_SUPPRESSED_WARNINGS = process.env.DEBUG_SUPPRESSED_WARNINGS === 'true';

function formatConsoleMessage(args: unknown[]): string {
  const firstArg = String(args[0] || '');

  // If first argument has %s placeholders, replace them with subsequent args
  if (firstArg.includes('%s')) {
    let formatted = firstArg;
    let argIndex = 1;
    formatted = formatted.replace(/%s/g, () => {
      return argIndex < args.length ? String(args[argIndex++]) : '%s';
    });
    return formatted;
  }

  // Otherwise, join all arguments with space (matches console output)
  return args.map((arg) => String(arg)).join(' ');
}

// Helper function to check if a message should be suppressed
function shouldSuppress(
  args: unknown[],
  originalLog: typeof console.error,
  logType: string,
): boolean {
  // Early escape: if no patterns configured, don't suppress anything
  if (SUPPRESSED_WARNINGS.length === 0) {
    return false;
  }

  const formattedMessage = formatConsoleMessage(args);

  // Show debug info if requested
  if (DEBUG_SUPPRESSED_WARNINGS) {
    originalLog.call(console, `[DEBUG] Console ${logType} (formatted):`);
    originalLog.call(console, ...args);
    originalLog.call(
      console,
      '[DEBUG] Pattern matching against:',
      formattedMessage.substring(0, 200),
    );
  }

  const suppressed = SUPPRESSED_WARNINGS.some((pattern) => pattern.test(formattedMessage));

  if (suppressed && DEBUG_SUPPRESSED_WARNINGS) {
    originalLog.call(console, `[DEBUG] ^^^ Suppressed above ${logType.toLowerCase()}`);
  }

  return suppressed;
}

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: unknown[]) => {
  if (!shouldSuppress(args, originalError, 'Error')) {
    originalError.call(console, ...args);
  }
};

console.warn = (...args: unknown[]) => {
  if (!shouldSuppress(args, originalWarn, 'Warning')) {
    originalWarn.call(console, ...args);
  }
};

/* *************** END SUPPRESSING CONSOLE WARNINGS *************** */

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

// Mock ai-react-state library to prevent cleanup errors when components using these hooks
// are rendered without AIStateProvider (e.g., when using renderWithoutProviders)
jest.mock('@redhat-cloud-services/ai-react-state', () => {
  const actual = jest.requireActual('@redhat-cloud-services/ai-react-state');
  return {
    ...actual,
    // Mock useActiveConversation to work without provider and return proper cleanup
    useActiveConversation: jest.fn(() => undefined),
    useMessages: jest.fn(() => []),
    useStreamChunk: jest.fn(() => undefined),
    useInProgress: jest.fn(() => false),
  };
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
    subscribe: jest.fn().mockReturnValue(jest.fn()), // Return a mock unsubscribe function
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
