import type { CellFormatter } from '@rhngui/patternfly-react-renderer';
import { SeverityIndicator } from './SeverityIndicator';

function formatDateMmDdYyyy(
  dateStr: string | number | boolean | (string | number)[] | null,
): string | number | boolean | (string | number)[] | null {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${month}/${day}/${year}`;
}

export const cveLinkFormatter: CellFormatter = (value) => {
  if (!value || typeof value !== 'string') return value;
  return (
    <a
      href={`https://access.stage.redhat.com/security/cve/${value}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'underline', textDecorationStyle: 'solid' }}
    >
      {value}
    </a>
  );
};

export const severityFormatter: CellFormatter = (value) => {
  if (!value || typeof value !== 'string') return value;
  return <SeverityIndicator severity={value} />;
};

export const dateFormatter: CellFormatter = (value) => {
  if (!value || typeof value !== 'string') return value;
  return formatDateMmDdYyyy(value);
};
