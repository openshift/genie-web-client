// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import * as fs from 'fs';
import * as path from 'path';

expect.extend(toHaveNoViolations);

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
