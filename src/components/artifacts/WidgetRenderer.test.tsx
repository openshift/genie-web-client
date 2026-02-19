import { render, screen } from '../../unitTestUtils';
import { WidgetRenderer } from './WidgetRenderer';
import type { NGUIWidget } from '../../types/chat';
import type { BasePersesProps } from '../../types/perses';

// Mock DynamicComponent
jest.mock('@rhngui/patternfly-react-renderer', () => ({
  __esModule: true,
  default: ({ config }: { config: Record<string, unknown> }) => (
    <div data-testid="dynamic-component" data-config={JSON.stringify(config)}>
      DynamicComponent
    </div>
  ),
}));

// Mock PersesComponentRegistry to avoid loading heavy Perses/echarts dependencies
jest.mock('../perses/componentRegistry', () => ({
  isPersesComponent: (name: unknown): boolean =>
    typeof name === 'string' && ['PersesTimeSeries', 'PersesPieChart'].includes(name),
  getPersesComponent: (name: string) => {
    const MockPersesTimeSeries = (props: BasePersesProps) => (
      <div
        data-testid="perses-time-series"
        data-query={props.query}
        data-duration={props.duration}
        data-step={props.step}
      />
    );
    const MockPersesPieChart = (props: BasePersesProps) => (
      <div
        data-testid="perses-pie-chart"
        data-query={props.query}
        data-duration={props.duration}
        data-step={props.step}
      />
    );
    const mocks: Record<string, React.FC<BasePersesProps>> = {
      PersesTimeSeries: MockPersesTimeSeries,
      PersesPieChart: MockPersesPieChart,
    };
    return mocks[name];
  },
}));

describe('WidgetRenderer', () => {
  describe('NGUI widgets', () => {
    it('renders DynamicComponent for standard NGUI widget', () => {
      const widget: NGUIWidget = {
        id: 'widget-1',
        type: 'ngui',
        spec: { type: 'button', label: 'Click me' },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
      expect(screen.queryByTestId('perses-time-series')).not.toBeInTheDocument();
    });

    it('renders PersesTimeSeries when component is PersesTimeSeries', () => {
      const widget: NGUIWidget = {
        id: 'widget-1',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          query: 'up{job="prometheus"}',
          duration: '1h',
          step: '1m',
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toBeInTheDocument();
      expect(persesComponent).toHaveAttribute('data-query', 'up{job="prometheus"}');
      expect(screen.queryByTestId('dynamic-component')).not.toBeInTheDocument();
    });

    it('renders PersesPieChart when component is PersesPieChart', () => {
      const widget: NGUIWidget = {
        id: 'widget-2',
        type: 'ngui',
        spec: {
          component: 'PersesPieChart',
          query: 'sum(rate(http_requests_total[5m]))',
          duration: '30m',
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-pie-chart');
      expect(persesComponent).toBeInTheDocument();
      expect(persesComponent).toHaveAttribute('data-query', 'sum(rate(http_requests_total[5m]))');
      expect(screen.queryByTestId('dynamic-component')).not.toBeInTheDocument();
    });

    it('renders DynamicComponent for unknown component type', () => {
      const widget: NGUIWidget = {
        id: 'widget-4',
        type: 'ngui',
        spec: {
          component: 'UnknownComponent',
          data: 'some data',
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
      expect(screen.queryByTestId('perses-time-series')).not.toBeInTheDocument();
      expect(screen.queryByTestId('perses-pie-chart')).not.toBeInTheDocument();
    });
  });

  describe('prop extraction', () => {
    it('provides default values for missing props', () => {
      const widget: NGUIWidget = {
        id: 'widget-5',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          query: 'up',
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toBeInTheDocument();
      expect(persesComponent).toHaveAttribute('data-query', 'up');
      expect(persesComponent).toHaveAttribute('data-duration', '1h');
      expect(persesComponent).toHaveAttribute('data-step', '1m');
    });

    it('handles empty query gracefully', () => {
      const widget: NGUIWidget = {
        id: 'widget-6',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toBeInTheDocument();
      expect(persesComponent).toHaveAttribute('data-query', '');
    });
  });

  describe('dataTypeMetadata extraction', () => {
    it('extracts query from dataTypeMetadata when present', () => {
      const widget: NGUIWidget = {
        id: 'widget-7',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          dataTypeMetadata: {
            query: 'rate(container_cpu_usage_seconds_total[5m])',
            duration: '1h',
            step: '1m',
          },
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toHaveAttribute(
        'data-query',
        'rate(container_cpu_usage_seconds_total[5m])',
      );
      expect(persesComponent).toHaveAttribute('data-duration', '1h');
      expect(persesComponent).toHaveAttribute('data-step', '1m');
    });

    it('prefers dataTypeMetadata over direct spec values', () => {
      const widget: NGUIWidget = {
        id: 'widget-8',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          query: 'old_query_from_spec',
          duration: '30m',
          dataTypeMetadata: {
            query: 'fresh_query_from_metadata',
            duration: '2h',
            step: '5m',
          },
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toHaveAttribute('data-query', 'fresh_query_from_metadata');
      expect(persesComponent).toHaveAttribute('data-duration', '2h');
      expect(persesComponent).toHaveAttribute('data-step', '5m');
    });

    it('falls back to spec values when dataTypeMetadata is not present', () => {
      const widget: NGUIWidget = {
        id: 'widget-9',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          query: 'fallback_query',
          duration: '1h',
          step: '2m',
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toHaveAttribute('data-query', 'fallback_query');
      expect(persesComponent).toHaveAttribute('data-duration', '1h');
      expect(persesComponent).toHaveAttribute('data-step', '2m');
    });

    it('uses spec values for fields missing from dataTypeMetadata', () => {
      const widget: NGUIWidget = {
        id: 'widget-10',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          query: 'spec_query',
          duration: 'spec_duration',
          step: 'spec_step',
          dataTypeMetadata: {
            query: 'metadata_query',
          },
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toHaveAttribute('data-query', 'metadata_query');
      expect(persesComponent).toHaveAttribute('data-duration', 'spec_duration');
      expect(persesComponent).toHaveAttribute('data-step', 'spec_step');
    });

    it('works with PersesPieChart and dataTypeMetadata', () => {
      const widget: NGUIWidget = {
        id: 'widget-11',
        type: 'ngui',
        spec: {
          component: 'PersesPieChart',
          dataTypeMetadata: {
            query: 'sum(kube_pod_status_phase) by (phase)',
            duration: '15m',
            step: '30s',
          },
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-pie-chart');
      expect(persesComponent).toHaveAttribute(
        'data-query',
        'sum(kube_pod_status_phase) by (phase)',
      );
      expect(persesComponent).toHaveAttribute('data-duration', '15m');
      expect(persesComponent).toHaveAttribute('data-step', '30s');
    });
  });
});
