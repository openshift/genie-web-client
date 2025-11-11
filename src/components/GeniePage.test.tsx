import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GeniePage from './GeniePage';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('GeniePage', () => {
  it('renders without crashing', () => {
    render(<GeniePage />);
    expect(screen.getByText('Open Left Drawer')).toBeInTheDocument();
    expect(screen.getByText('Open Right Drawer')).toBeInTheDocument();
  });

  it('displays the genie text', () => {
    render(<GeniePage />);
    expect(screen.getByText('genie')).toBeInTheDocument();
  });

  it('opens left drawer when button is clicked', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<GeniePage />);
    
    const leftDrawerButton = screen.getByText('Open Left Drawer');
    await user.click(leftDrawerButton);
    
    // The drawer should be opened
    expect(screen.getByText('Left Drawer')).toBeInTheDocument();
    expect(screen.getByText('This is content in the left drawer.')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('opens right drawer when button is clicked', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<GeniePage />);
    
    const rightDrawerButton = screen.getByText('Open Right Drawer');
    await user.click(rightDrawerButton);
    
    // The drawer should be opened
    expect(screen.getByText('Right Drawer')).toBeInTheDocument();
    expect(screen.getByText('This is content in the right drawer.')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});

