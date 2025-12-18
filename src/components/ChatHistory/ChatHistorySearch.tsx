import { SearchInput } from '@patternfly/react-core';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ChatHistorySearchProps {
  onSearch: (value: string) => void;
  resultsCount: number;
}

export function ChatHistorySearch(props: ChatHistorySearchProps): JSX.Element {
  const { onSearch, resultsCount } = props;
  const { t } = useTranslation('plugin__genie-web-client');
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, value: string) => {
      setValue(value);
      onSearch(value);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <SearchInput
      aria-label={t('chatHistory.search.ariaLabel')}
      placeholder={t('chatHistory.search.placeholder')}
      value={value}
      onChange={handleChange}
      onClear={handleClear}
      resultsCount={resultsCount}
    />
  );
}
