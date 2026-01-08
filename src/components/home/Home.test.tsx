import React from 'react';
import { render, screen } from '../../unitTestUtils';
import { Home } from './Home';
import { AIStateProvider } from '@redhat-cloud-services/ai-react-state';
import { stateManager } from '../utils/aiStateManager';

// Stub out MessageBar so it doesn't render (but remains a valid component)
jest.mock('@patternfly/chatbot', () => ({
  // eslint-disable-next-line react/display-name
  MessageBar: React.forwardRef(() => null),
}));

describe('Home', () => {
  const renderWithProviders = () =>
    render(
      <AIStateProvider stateManager={stateManager}>
        <Home />
      </AIStateProvider>,
    );

  it('renders heading without username when none stored', () => {
    renderWithProviders();
    expect(
      screen.getByRole('heading', {
        name: /every dashboard tells a story\. what will yours say\?/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders description and CTA', () => {
    renderWithProviders();

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
