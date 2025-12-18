import { useState } from 'react';
import { SearchInput } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface ChatHistorySearchProps {
  onSearch: (value: string) => void;
  resultsCount: number;
}

export function ChatHistorySearch(props: ChatHistorySearchProps) {
  const { onSearch, resultsCount } = props;
  const { t } = useTranslation('plugin__genie-web-client');
  const [value, setValue] = useState('');

  const onChange = (value: string) => {
    setValue(value);
    onSearch(value);
  };

  const onClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <SearchInput
      aria-label={t('chatHistory.search.ariaLabel')}
      placeholder={t('chatHistory.search.placeholder')}
      value={value}
      onChange={(_event, value) => onChange(value)}
      onClear={onClear}
      resultsCount={resultsCount}
    />
  );
}
