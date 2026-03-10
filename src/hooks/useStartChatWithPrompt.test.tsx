import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom-v5-compat';
import { renderHook, act } from '../unitTestUtils';
import { useStartChatWithPrompt } from './useStartChatWithPrompt';
import { getStartChatWithPromptUrl } from '../components/routeList';

const mockNavigate = jest.fn();

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
}));

describe('useStartChatWithPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/genie']}>{children}</MemoryRouter>
  );

  it('returns a function that navigates to start-chat URL with encoded prompt', () => {
    const { result } = renderHook(() => useStartChatWithPrompt(), { wrapper });

    act(() => {
      result.current('Can you help me create a new dashboard?');
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      getStartChatWithPromptUrl('Can you help me create a new dashboard?'),
    );
  });

  it('calls navigate with different URL when prompt differs', () => {
    const { result } = renderHook(() => useStartChatWithPrompt(), { wrapper });

    act(() => {
      result.current('Help me troubleshoot');
    });

    expect(mockNavigate).toHaveBeenCalledWith(getStartChatWithPromptUrl('Help me troubleshoot'));
  });
});
