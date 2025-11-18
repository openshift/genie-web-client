import { render, screen, fireEvent } from '@testing-library/react';
import { LegalModal } from '../LegalModal';

// Mock i18n to return the key
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('LegalModal', () => {
  const titleKey = 'plugin__genie-web-client~termsUse';
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockReset();
  });

  it('renders title from i18n key and children when open', () => {
    render(
      <LegalModal isOpen titleKey={titleKey} onClose={onClose}>
        <div data-testid="modal-body">Body content</div>
      </LegalModal>,
    );

    // Title rendered via t(titleKey)
    expect(screen.getByText(titleKey)).toBeInTheDocument();
    // Children appear inside modal body
    expect(screen.getByTestId('modal-body')).toBeInTheDocument();
  });

  it('renders optional title and subtitle when provided', () => {
    render(
      <LegalModal isOpen titleKey={titleKey} title="RH Terms" subtitle="Last updated: March 20, 2023" onClose={onClose}>
        <span />
      </LegalModal>,
    );
    expect(screen.getByText('RH Terms')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
  });

  it('invokes onClose when the close button is clicked', () => {
    render(
      <LegalModal isOpen titleKey={titleKey} onClose={onClose}>
        <span />
      </LegalModal>,
    );
    // PF Modal renders a Close button
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render visible dialog when closed', () => {
    render(
      <LegalModal isOpen={false} titleKey={titleKey} onClose={onClose}>
        <span />
      </LegalModal>,
    );
    // No heading with the title key should be present
    expect(screen.queryByText(titleKey)).not.toBeInTheDocument();
  });
});