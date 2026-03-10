/**
 * Perses Component Registry
 *
 * Maps Perses component names to their lazy-loaded implementations.
 * Uses React.lazy() for code splitting - Perses components are only loaded when needed.
 */
import { lazy, type ComponentType } from 'react';
import type { BasePersesProps, PersesComponentName } from '../../types/perses';

/**
 * Registry of lazy-loaded Perses components mapped by their component name.
 * Components are loaded on-demand to reduce initial bundle size.
 */
const PERSES_COMPONENTS: Record<PersesComponentName, ComponentType<BasePersesProps>> = {
  PersesTimeSeries: lazy(() => import('./PersesTimeSeries')) as ComponentType<BasePersesProps>,
  PersesPieChart: lazy(() => import('./PersesPieChart')) as ComponentType<BasePersesProps>,
};

/**
 * Type guard to check if a component name is a registered Perses component.
 */
export function isPersesComponent(name: unknown): name is PersesComponentName {
  return typeof name === 'string' && name in PERSES_COMPONENTS;
}

/**
 * Get the lazy-loaded Perses component for a given component name.
 * Must be rendered inside a <Suspense> boundary.
 */
export function getPersesComponent(
  componentName: PersesComponentName,
): ComponentType<BasePersesProps> {
  return PERSES_COMPONENTS[componentName];
}
