import { isAladdinDashboard, isCodeArtifact } from './artifactTypeGuards';
import type { AladdinDashboard } from '../types/dashboard';
import type { CodeArtifact } from '../types/chat';

// Helper to create a mock AladdinDashboard
const createMockDashboard = (name: string): AladdinDashboard => ({
  apiVersion: 'aladdin.openshift.io/v1alpha1',
  kind: 'AladdinDashboard',
  metadata: {
    name,
    namespace: 'default',
  },
  spec: {
    title: `Test Dashboard ${name}`,
    layout: {
      columns: 12,
      panels: [],
    },
  },
});

// Helper to create a mock CodeArtifact
const createMockCodeArtifact = (id: string): CodeArtifact => ({
  id,
  type: 'code',
  createdAt: new Date(),
});

describe('artifactTypeGuards', () => {
  describe('isAladdinDashboard', () => {
    it('returns true for a valid AladdinDashboard', () => {
      const dashboard = createMockDashboard('test-dashboard');

      expect(isAladdinDashboard(dashboard)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isAladdinDashboard(null)).toBe(false);
    });

    it('returns false for a CodeArtifact', () => {
      const codeArtifact = createMockCodeArtifact('code-1');

      expect(isAladdinDashboard(codeArtifact)).toBe(false);
    });

    it('returns false for an object without kind property', () => {
      const artifact = { type: 'code', id: 'test' };

      expect(isAladdinDashboard(artifact as CodeArtifact)).toBe(false);
    });

    it('returns false for an object with a different kind', () => {
      const artifact = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: 'test' },
        spec: {},
      };

      expect(isAladdinDashboard(artifact as unknown as AladdinDashboard)).toBe(false);
    });
  });

  describe('isCodeArtifact', () => {
    it('returns true for a valid CodeArtifact', () => {
      const codeArtifact = createMockCodeArtifact('code-1');

      expect(isCodeArtifact(codeArtifact)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isCodeArtifact(null)).toBe(false);
    });

    it('returns false for an AladdinDashboard', () => {
      const dashboard = createMockDashboard('test-dashboard');

      expect(isCodeArtifact(dashboard)).toBe(false);
    });

    it('returns false for an object without type property', () => {
      const artifact = { kind: 'AladdinDashboard', id: 'test' };

      expect(isCodeArtifact(artifact as unknown as CodeArtifact)).toBe(false);
    });

    it('returns false for an object with a different type', () => {
      const artifact = {
        id: 'test',
        type: 'widget',
        createdAt: new Date(),
      };

      expect(isCodeArtifact(artifact as unknown as CodeArtifact)).toBe(false);
    });
  });
});
