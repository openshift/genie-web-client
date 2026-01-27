import { ReactElement, ReactNode } from 'react';
import { axe } from 'jest-axe';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom-v5-compat';
import { render, RenderOptions } from '@testing-library/react';
import { AIStateProvider } from './hooks/AIState';
import { ChatBarProvider } from './components/ChatBarContext';
import { stateManager } from './components/utils/aiStateManager';
export * from '@testing-library/react';
export { renderHook } from '@testing-library/react-hooks';

const user = userEvent.setup();
export { user };

export const checkAccessibility = async (container: HTMLElement | string) =>
  expect(await axe(container)).toHaveNoViolations();

/**
 * Router options for the custom render function
 */
export interface RouterOptions {
  initialEntries?: MemoryRouterProps['initialEntries'];
  future?: MemoryRouterProps['future'];
}

/**
 * Custom render function that wraps components in common providers (AIStateProvider, ChatBarProvider) and MemoryRouter.
 * This eliminates the need to manually wrap components in providers in each test.
 *
 * Note: react-i18next is automatically mocked globally in setupTests.ts with real translations
 * from locales/en/plugin__genie-web-client.json, so you don't need to mock it in individual tests.
 *
 * @example
 * // Default: includes all providers
 * const { getByText } = render(<Home />);
 *
 * // Custom router options
 * const { getByText } = render(<GeniePage />, { initialEntries: ['/genie'] });
 */
const renderWithProviders = (
  ui: ReactElement,
  routerOptions: RouterOptions = {},
  renderOptions?: Omit<RenderOptions, 'wrapper'>,
) => {
  const {
    initialEntries = ['/'],
    future = { v7_startTransition: true, v7_relativeSplatPath: true },
  } = routerOptions;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <MemoryRouter initialEntries={initialEntries} future={future}>
        <AIStateProvider stateManager={stateManager}>
          <ChatBarProvider>{children}</ChatBarProvider>
        </AIStateProvider>
      </MemoryRouter>
    );
  };

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

/**
 * Custom render function without providers - use this when you need to provide your own provider setup.
 * Only includes MemoryRouter.
 *
 * @example
 * // Custom provider setup
 * renderWithoutProviders(
 *   <CustomProvider>
 *     <Component />
 *   </CustomProvider>
 * );
 */
const renderWithoutProviders = (
  ui: ReactElement,
  routerOptions: RouterOptions = {},
  renderOptions?: Omit<RenderOptions, 'wrapper'>,
) => {
  const {
    initialEntries = ['/'],
    future = { v7_startTransition: true, v7_relativeSplatPath: true },
  } = routerOptions;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <MemoryRouter initialEntries={initialEntries} future={future}>
        {children}
      </MemoryRouter>
    );
  };

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

export { renderWithProviders as render, renderWithoutProviders };
