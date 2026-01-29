import React from 'react';
import { render, screen } from '../../unitTestUtils';
import { Home } from './Home';
import { AIProvider } from '../../hooks/AIState';
import { CreateModeProvider } from '../create-mode';

// Stub out MessageBar so it doesn't render (but remains a valid component)
jest.mock('@patternfly/chatbot', () => ({
  // eslint-disable-next-line react/display-name
  MessageBar: React.forwardRef(() => null),
}));

describe('Home', () => {
  const renderWithProviders = () =>
    render(
      <AIProvider>
        <CreateModeProvider>
          <Home />
        </CreateModeProvider>
      </AIProvider>,
    );

  it('renders heading without username when none stored', () => {
    renderWithProviders();
    expect(
      screen.getByRole('heading', {
        name: /every dashboard tells a story\. what will yours say\?/i,
      }),
    ).toBeInTheDocument();
  });

  it('displays description and CTA on initial render', () => {
    render(
      <CreateModeProvider>
        <Home />
      </CreateModeProvider>,
    );

    expect(
      screen.getByText(
        /Begin with Genie — transform your OpenShift data into insight, and insight into action\./i,
      ),
    ).toBeInTheDocument();

    const cta = screen.getByRole('button', { name: /create your first dashboard/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toBeEnabled();
  });
});
