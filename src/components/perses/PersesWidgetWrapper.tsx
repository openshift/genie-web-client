import { PropsWithChildren, useMemo } from 'react';

import { DatasourceStoreProvider, VariableProvider } from '@perses-dev/dashboards';
import { ChartsProvider, SnackbarProvider } from '@perses-dev/components';
import { PluginRegistry, TimeRangeProviderBasic } from '@perses-dev/plugin-system';
import { generateChartsTheme, getTheme } from '@perses-dev/components';
import { QueryClientProvider } from '@tanstack/react-query';
import type { DurationString } from '@perses-dev/prometheus-plugin';

import { pluginLoader } from './pluginsLoader';
import persesQueryClient from './queryClient';
import { CachedDatasourceAPI } from './cachedDatasource';
import { OcpDatasourceApi, PERSES_PROXY_BASE_PATH } from './ocpDatasourceApi';

export const muiTheme = getTheme('light');
export const chartsTheme = generateChartsTheme(muiTheme, {});

const persesTimeRange = {
  pastDuration: '1h' as DurationString,
};

const PersesWidgetWrapper = ({
  children,
}: PropsWithChildren<Record<string, unknown>>): JSX.Element => {
  const datasourceApi = useMemo(() => {
    return new CachedDatasourceAPI(new OcpDatasourceApi(PERSES_PROXY_BASE_PATH));
  }, []);
  return (
    <ChartsProvider chartsTheme={chartsTheme}>
      <SnackbarProvider
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="default"
      >
        <PluginRegistry pluginLoader={pluginLoader}>
          <QueryClientProvider client={persesQueryClient}>
            <TimeRangeProviderBasic initialTimeRange={persesTimeRange}>
              <VariableProvider>
                <DatasourceStoreProvider datasourceApi={datasourceApi}>
                  <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                    {children}
                  </div>
                </DatasourceStoreProvider>
              </VariableProvider>
            </TimeRangeProviderBasic>
          </QueryClientProvider>
        </PluginRegistry>
      </SnackbarProvider>
    </ChartsProvider>
  );
};

export default PersesWidgetWrapper;
