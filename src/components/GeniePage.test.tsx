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
    // Assert key accessible UI elements rendered by Layout
    expect(screen.getByAltText('Genie Logo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Home/i })).toBeInTheDocument();
  });
});
