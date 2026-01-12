import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'genie-theme-preference';
const PREFERS_DARK_SCHEME = '(prefers-color-scheme: dark)';
const PF_THEME_LIGHT = 'pf-v6-theme-light';
const PF_THEME_DARK = 'pf-v6-theme-dark';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // check localStorage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    // fall back to system preference
    if (window.matchMedia(PREFERS_DARK_SCHEME).matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // apply theme class to html element
    document.documentElement.classList.remove(PF_THEME_LIGHT, PF_THEME_DARK);
    document.documentElement.classList.add(theme === 'dark' ? PF_THEME_DARK : PF_THEME_LIGHT);

    // save preference
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // listen for OS theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia(PREFERS_DARK_SCHEME);
    const handleChange = (e: MediaQueryListEvent) => {
      // only update if user hasn't set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    // modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // older browser fallback
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
