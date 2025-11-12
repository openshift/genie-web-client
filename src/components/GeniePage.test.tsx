import { render, screen } from '@testing-library/react';
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
});

