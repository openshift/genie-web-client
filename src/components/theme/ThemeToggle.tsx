import React from 'react';
import { Button, Tooltip, TooltipProps } from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
  tooltipProps?: Partial<TooltipProps>;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ tooltipProps }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tooltip content={isDark ? 'Switch to light mode' : 'Switch to dark mode'} {...tooltipProps}>
      <Button
        variant="plain"
        icon={isDark ? <SunIcon /> : <MoonIcon />}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
      />
    </Tooltip>
  );
};
