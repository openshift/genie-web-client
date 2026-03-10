import { render, screen, user } from '../../unitTestUtils';
import { Home } from './Home';
import { AIProvider } from '../../hooks/AIState';
import { CREATE_DASHBOARD_PROMPT } from '../../constants/prompts';

const mockStartChatWithPrompt = jest.fn();

jest.mock('../../hooks/useStartChatWithPrompt', () => ({
  useStartChatWithPrompt: () => mockStartChatWithPrompt,
}));

describe('Home', () => {
  const renderWithProviders = () =>
    render(
      <AIProvider>
        <Home />
      </AIProvider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders heading without username when none stored', () => {
    renderWithProviders();
    expect(
      screen.getByRole('heading', {
        name: /every dashboard tells a story\. what will yours say\?/i,
      }),
    ).toBeInTheDocument();
  });

  it('displays description and CTA on initial render', () => {
    render(<Home />);

    expect(
      screen.getByText(
        /Begin with Genie — transform your OpenShift data into insight, and insight into action\./i,
      ),
    ).toBeInTheDocument();

    const cta = screen.getByRole('button', { name: /create your first dashboard/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toBeEnabled();
  });

  it('calls startChatWithPrompt with create-dashboard message when CTA is clicked', async () => {
    render(<Home />);
    const cta = screen.getByRole('button', { name: /create your first dashboard/i });
    await user.click(cta);
    expect(mockStartChatWithPrompt).toHaveBeenCalledTimes(1);
    expect(mockStartChatWithPrompt).toHaveBeenCalledWith(CREATE_DASHBOARD_PROMPT);
  });
});
