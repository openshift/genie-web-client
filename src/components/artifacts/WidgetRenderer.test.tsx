import { render, screen } from '../../unitTestUtils';
import { WidgetRenderer } from './WidgetRenderer';
import type { NGUIWidget } from '../../types/chat';
import type { ToolCallState } from '../../utils/toolCallHelpers';
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
          // Missing: start, end, duration, step
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toBeInTheDocument();
      expect(persesComponent).toHaveAttribute('data-query', 'up');
    });

    it('handles empty query gracefully', () => {
      const widget: NGUIWidget = {
        id: 'widget-6',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          // Missing query
        },
        createdAt: new Date(),
      };

      render(<WidgetRenderer widget={widget} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toBeInTheDocument();
      expect(persesComponent).toHaveAttribute('data-query', '');
    });
  });

  describe('tool call lookup', () => {
    it('extracts query from tool call args when input_data_type matches', () => {
      const widget: NGUIWidget = {
        id: 'widget-7',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          input_data_type: 'execute_range_query',
          // NGUI spec might not have query, but tool call does
        },
        createdAt: new Date(),
      };

      const toolCalls: ToolCallState[] = [
        {
          id: 'tc-1',
          name: 'execute_range_query',
          status: 'success',
          arguments: {
            query: 'rate(container_cpu_usage_seconds_total[5m])',
            duration: '1h',
            step: '1m',
          },
        },
      ];

      render(<WidgetRenderer widget={widget} toolCalls={toolCalls} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toHaveAttribute(
        'data-query',
        'rate(container_cpu_usage_seconds_total[5m])',
      );
    });

    it('prefers tool call args over NGUI spec values', () => {
      const widget: NGUIWidget = {
        id: 'widget-8',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          input_data_type: 'execute_range_query',
          query: 'old_query_from_spec',
          duration: '30m',
        },
        createdAt: new Date(),
      };

      const toolCalls: ToolCallState[] = [
        {
          id: 'tc-1',
          name: 'execute_range_query',
          status: 'success',
          arguments: {
            query: 'fresh_query_from_tool_call',
            duration: '2h',
            step: '5m',
          },
        },
      ];

      render(<WidgetRenderer widget={widget} toolCalls={toolCalls} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      // Should use tool call args, not spec values
      expect(persesComponent).toHaveAttribute('data-query', 'fresh_query_from_tool_call');
    });

    it('falls back to spec values when no matching tool call found', () => {
      const widget: NGUIWidget = {
        id: 'widget-9',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          input_data_type: 'execute_range_query',
          query: 'fallback_query',
          duration: '1h',
        },
        createdAt: new Date(),
      };

      const toolCalls: ToolCallState[] = [
        {
          id: 'tc-1',
          name: 'some_other_tool',
          status: 'success',
          arguments: {
            query: 'different_query',
          },
        },
      ];

      render(<WidgetRenderer widget={widget} toolCalls={toolCalls} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      expect(persesComponent).toHaveAttribute('data-query', 'fallback_query');
    });

    it('uses most recent matching tool call when multiple exist', () => {
      const widget: NGUIWidget = {
        id: 'widget-10',
        type: 'ngui',
        spec: {
          component: 'PersesTimeSeries',
          input_data_type: 'execute_range_query',
        },
        createdAt: new Date(),
      };

      const toolCalls: ToolCallState[] = [
        {
          id: 'tc-1',
          name: 'execute_range_query',
          status: 'success',
          arguments: {
            query: 'first_query',
          },
        },
        {
          id: 'tc-2',
          name: 'execute_range_query',
          status: 'success',
          arguments: {
            query: 'second_query',
          },
        },
      ];

      render(<WidgetRenderer widget={widget} toolCalls={toolCalls} />);

      const persesComponent = screen.getByTestId('perses-time-series');
      // Should use the most recent (last) matching tool call
      expect(persesComponent).toHaveAttribute('data-query', 'second_query');
    });

    it('works with execute_instant_query for PersesPieChart', () => {
      const widget: NGUIWidget = {
        id: 'widget-11',
        type: 'ngui',
        spec: {
          component: 'PersesPieChart',
          input_data_type: 'execute_instant_query',
        },
        createdAt: new Date(),
      };

      const toolCalls: ToolCallState[] = [
        {
          id: 'tc-1',
          name: 'execute_instant_query',
          status: 'success',
          arguments: {
            query: 'sum(kube_pod_status_phase) by (phase)',
          },
        },
      ];

      render(<WidgetRenderer widget={widget} toolCalls={toolCalls} />);

      const persesComponent = screen.getByTestId('perses-pie-chart');
      expect(persesComponent).toHaveAttribute(
        'data-query',
        'sum(kube_pod_status_phase) by (phase)',
      );
    });
  });
});
