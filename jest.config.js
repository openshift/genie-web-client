module.exports = {
  // Use ts-jest preset which provides default configurations for TypeScript projects
  preset: 'ts-jest',

  // Use jsdom environment to simulate a browser (provides window, document, etc.)
  testEnvironment: 'jsdom',

  // Tell Jest where to look for test files (only search in src directory)
  roots: ['<rootDir>/src'],

  // Patterns that Jest uses to find test files
  // Matches any .test.ts or .test.tsx files in the src directory
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],

  // Transform TypeScript files using ts-jest before running tests
  transform: {
    // Any file ending in .ts or .tsx will be processed by ts-jest
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // File extensions Jest should recognize and process
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Setup file that runs after the test framework is installed in the environment
  // This is where we import @testing-library/jest-dom for custom matchers
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Mock CSS imports so they don't cause errors in tests
  moduleNameMapper: {
    // When any CSS file is imported, use the styleMock.js file instead
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    // Stub image imports (e.g., SVGs) to a simple string
    '\\.(svg|png|jpe?g|gif|webp|avif)$': '<rootDir>/__mocks__/fileMock.js',
    '^@patternfly/chatbot$': '<rootDir>/__mocks__/patternflyChatbotMock.js',
  },

  // Specify which files should be included in coverage reports
  collectCoverageFrom: [
    // Include all TypeScript files in src directory
    'src/**/*.{ts,tsx}',
    // Exclude test files from coverage
    '!src/**/*.test.{ts,tsx}',
    // Exclude test setup file
    '!src/setupTests.ts',
  ],

  // Directories to ignore when collecting coverage
  coveragePathIgnorePatterns: [
    // Ignore installed dependencies
    '/node_modules/',
    // Ignore build output
    '/dist/',
  ],

  // Global configuration options for ts-jest
  globals: {
    'ts-jest': {
      // TypeScript compiler options specifically for tests
      tsconfig: {
        // Enable new JSX transform (React 17+) - no need to import React for JSX
        jsx: 'react-jsx',
        // Allow default imports from modules with no default export
        esModuleInterop: true,
        // Allow default imports from modules without default exports (works with esModuleInterop)
        allowSyntheticDefaultImports: true,
      },
    },
  },
};

