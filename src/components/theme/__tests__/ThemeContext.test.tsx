import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../ThemeContext';

// simple test component
const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light-button">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark-button">
        Set Dark
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // clean slate for each test
    localStorage.clear();
    document.documentElement.classList.remove('pf-v6-theme-light', 'pf-v6-theme-dark');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    // suppress console noise for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
      // intentionally empty
    });

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within ThemeProvider');

    consoleError.mockRestore();
  });

  it('should initialize with light theme by default', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('pf-v6-theme-light')).toBe(true);
  });

  it('should toggle theme from light to dark', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    await user.click(screen.getByTestId('toggle-button'));

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
      expect(document.documentElement.classList.contains('pf-v6-theme-light')).toBe(false);
    });
  });

  it('should toggle theme from dark to light', async () => {
    const user = userEvent.setup();
    localStorage.setItem('genie-theme-preference', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    await user.click(screen.getByTestId('toggle-button'));

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('pf-v6-theme-light')).toBe(true);
      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(false);
    });
  });

  it('should set theme to light explicitly', async () => {
    const user = userEvent.setup();
    localStorage.setItem('genie-theme-preference', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    await user.click(screen.getByTestId('set-light-button'));

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('pf-v6-theme-light')).toBe(true);
    });
  });

  it('should set theme to dark explicitly', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    await user.click(screen.getByTestId('set-dark-button'));

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
    });
  });

  it('should persist theme preference to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    await user.click(screen.getByTestId('toggle-button'));

    await waitFor(() => {
      expect(localStorage.getItem('genie-theme-preference')).toBe('dark');
    });
  });

  it('should load theme from localStorage on mount', () => {
    localStorage.setItem('genie-theme-preference', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
  });

  it('should detect console dark theme when no localStorage value exists', () => {
    // simulate console having dark theme set
    document.documentElement.classList.add('pf-v6-theme-dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });
});
