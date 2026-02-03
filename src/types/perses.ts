/**
 * Type definitions for Perses chart components.
 * Each chart type has its own props interface to support different query types.
 */

/** Base props shared by all Perses chart components */
export interface BasePersesProps {
  query: string;
  /** Start time - if undefined, uses duration for relative time range */
  start?: string;
  /** End time - if undefined, uses duration for relative time range */
  end?: string;
  duration: string;
  step: string;
}

/** Props for range query charts (TimeSeriesChart) */
export type PersesTimeSeriesProps = BasePersesProps;

/** Props for instant query charts (PieChart) */
export type PersesPieChartProps = BasePersesProps;

/** Union of all Perses component names */
export type PersesComponentName = 'PersesTimeSeries' | 'PersesPieChart';

/** Map component names to their props types */
export interface PersesPropsMap {
  PersesTimeSeries: PersesTimeSeriesProps;
  PersesPieChart: PersesPieChartProps;
}
