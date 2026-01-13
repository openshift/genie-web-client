import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'genie-theme-preference';
const PF_THEME_LIGHT = 'pf-v6-theme-light';
const PF_THEME_DARK = 'pf-v6-theme-dark';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // check localStorage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;

    // first time user: detect console's theme and save it
    const detectedTheme = document.documentElement.classList.contains(PF_THEME_DARK)
      ? 'dark'
      : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, detectedTheme);
    return detectedTheme;
  });

  useEffect(() => {
    // apply theme class to html element
    document.documentElement.classList.remove(PF_THEME_LIGHT, PF_THEME_DARK);
    document.documentElement.classList.add(theme === 'dark' ? PF_THEME_DARK : PF_THEME_LIGHT);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    // save user's explicit choice
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    // save user's explicit choice
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
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
