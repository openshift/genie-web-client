import { useState } from 'react';
import { SearchInput } from '@patternfly/react-core';

interface ChatHistorySearchProps {
  onSearch: (value: string) => void;
  resultsCount: number;
}

export function ChatHistorySearch(props: ChatHistorySearchProps) {
  const { onSearch, resultsCount } = props;
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
      aria-label="Find conversation"
      placeholder="Find conversation"
      value={value}
      onChange={(_event, value) => onChange(value)}
      onClear={onClear}
      resultsCount={resultsCount}
    />
  );
}
