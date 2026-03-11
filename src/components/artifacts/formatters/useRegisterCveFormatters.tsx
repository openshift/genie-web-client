import { useEffect } from 'react';
import { useComponentHandlerRegistry } from '@rhngui/patternfly-react-renderer';
import { cveLinkFormatter, severityFormatter, dateFormatter } from './cveFormatters';

export function useRegisterCveFormatters(): void {
  const registry = useComponentHandlerRegistry();

  useEffect(() => {
    registry.registerFormatterById('cve', cveLinkFormatter);
    registry.registerFormatterById('severity', severityFormatter);
    registry.registerFormatterById('public-date', dateFormatter);

    return () => {
      registry.unregisterFormatterById('cve');
      registry.unregisterFormatterById('severity');
      registry.unregisterFormatterById('public-date');
    };
  }, [registry]);
}
