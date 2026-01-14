import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../ThemeContext';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('pf-v6-theme-light', 'pf-v6-theme-dark');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render with moon icon for light theme', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();
  });

  it('should render with sun icon for dark theme', () => {
    localStorage.setItem('genie-theme-preference', 'dark');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
  });

  it('should toggle theme when clicked', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    // starts in light mode
    let button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();

    // click to switch
    await user.click(button);

    // now in dark mode
    button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
  });

  it('should show correct tooltip for light theme', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: /switch to dark mode/i });

    // hover to show tooltip
    await user.hover(button);

    // check aria label
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('should show correct tooltip for dark theme', async () => {
    const user = userEvent.setup();
    localStorage.setItem('genie-theme-preference', 'dark');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: /switch to light mode/i });

    // hover to show tooltip
    await user.hover(button);

    // check aria label
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: /switch to dark mode/i });

    // tab to focus
    await user.tab();
    expect(button).toHaveFocus();

    // press enter to toggle
    await user.keyboard('{Enter}');

    // should be dark now
    expect(document.documentElement.classList.contains('pf-v6-theme-dark')).toBe(true);
  });
});
