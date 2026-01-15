import React from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useTheme } from './ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tooltip content={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Button
        variant="plain"
        icon={isDark ? <SunIcon /> : <MoonIcon />}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
      />
    </Tooltip>
  );
};
