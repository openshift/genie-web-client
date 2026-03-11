import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import {
  SeverityCriticalIcon,
  SeverityImportantIcon,
  SeverityModerateIcon,
  SeverityMinorIcon,
  SeverityNoneIcon,
  SeverityUndefinedIcon,
} from '@patternfly/react-icons';

const SEVERITY_ICONS: Record<
  string,
  React.ComponentType<{ color?: string; className?: string }>
> = {
  critical: SeverityCriticalIcon,
  important: SeverityImportantIcon,
  moderate: SeverityModerateIcon,
  minor: SeverityMinorIcon,
  none: SeverityNoneIcon,
  undefined: SeverityUndefinedIcon,
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'var(--pf-t--global--icon--color--severity--critical--default)',
  important: 'var(--pf-t--global--icon--color--severity--important--default)',
  moderate: 'var(--pf-t--global--icon--color--severity--moderate--default)',
  minor: 'var(--pf-t--global--icon--color--severity--minor--default)',
  none: 'var(--pf-t--global--icon--color--severity--none--default)',
  undefined: 'var(--pf-t--global--icon--color--severity--undefined--default)',
};

export function getSeverityType(
  severity: string,
): 'critical' | 'important' | 'moderate' | 'minor' | 'none' | 'undefined' {
  const s = (severity || '').toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'important') return 'important';
  if (s === 'moderate') return 'moderate';
  if (s === 'low') return 'minor';
  if (s === 'none' || s === 'n/a') return 'none';
  return 'undefined';
}

export interface SeverityIndicatorProps {
  severity: string;
}

export const SeverityIndicator: React.FunctionComponent<SeverityIndicatorProps> = ({
  severity,
}) => {
  const type = getSeverityType(severity);
  const Icon = SEVERITY_ICONS[type] ?? SEVERITY_ICONS.undefined;
  const color = SEVERITY_COLORS[type] ?? SEVERITY_COLORS.undefined;

  return (
    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <span
          className="cve-severity-icon"
          data-severity={type}
          title={`${severity} severity`}
          style={{ color }}
        >
          <Icon />
        </span>
      </FlexItem>
      <FlexItem className="cve-severity-text" style={{ textTransform: 'capitalize' }}>
        {severity}
      </FlexItem>
    </Flex>
  );
};
