import { Panel } from '@perses-dev/dashboards';
import {
  DataQueriesProvider,
  TimeRangeProviderBasic,
  useSuggestedStepMs,
} from '@perses-dev/plugin-system';
import { DEFAULT_PROM } from '@perses-dev/prometheus-plugin';
import { useRef } from 'react';
import useResizeObserver from 'use-resize-observer';
import PersesWidgetWrapper from './PersesWidgetWrapper';
import { useTimeRange } from '../../hooks/useTimeRange';

type PersesPieChartProps = {
  duration: string;
  end: string;
  query: string;
  start: string;
  step: string;
};

const PieChartInner = ({ query }: PersesPieChartProps) => {
  const datasource = DEFAULT_PROM;
  const panelRef = useRef<HTMLDivElement>(null);
  const { width } = useResizeObserver({ ref: panelRef });
  const suggestedStepMs = useSuggestedStepMs(width);

  const definitions =
    query !== ''
      ? [
          {
            kind: 'PrometheusTimeSeriesQuery',
            spec: {
              datasource: {
                kind: datasource.kind,
                name: datasource.name,
              },
              query: query,
            },
          },
        ]
      : [];

  return (
    <div ref={panelRef} style={{ width: '100%', height: '100%' }}>
      <DataQueriesProvider definitions={definitions} options={{ suggestedStepMs, mode: 'instant' }}>
        <Panel
          panelOptions={{
            hideHeader: true,
          }}
          definition={{
            kind: 'Panel',
            spec: {
              queries: [],
              display: { name: '' },
              plugin: {
                kind: 'PieChart',
                spec: {
                  calculation: 'last',
                  legend: { placement: 'right' },
                  value: { placement: 'center' },
                },
              },
            },
          }}
        />
      </DataQueriesProvider>
    </div>
  );
};

const PersesPieChart = (props: PersesPieChartProps) => {
  const timeSeriesProps = props;
  const timeRange = useTimeRange(
    timeSeriesProps.start,
    timeSeriesProps.end,
    timeSeriesProps.duration,
  );
  return (
    <PersesWidgetWrapper>
      <TimeRangeProviderBasic initialTimeRange={timeRange} initialRefreshInterval="0s">
        <PieChartInner {...timeSeriesProps} />
      </TimeRangeProviderBasic>
    </PersesWidgetWrapper>
  );
};

export default PersesPieChart;
