import React, { ReactElement } from 'react';
import { axe } from 'jest-axe';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom-v5-compat';
import { render, RenderOptions } from '@testing-library/react';
export * from '@testing-library/react';

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
 * Custom render function that wraps components in MemoryRouter.
 * This eliminates the need to manually wrap components in MemoryRouter in each test.
 *
 * @example
 * const { getByText } = renderWithRouter(<GeniePage />);
 * const { getByText } = renderWithRouter(<GeniePage />, { initialEntries: ['/genie'] });
 */
const renderWithRouter = (
  ui: ReactElement,
  routerOptions: RouterOptions = {},
  renderOptions?: Omit<RenderOptions, 'wrapper'>,
) => {
  const {
    initialEntries = ['/'],
    future = { v7_startTransition: true, v7_relativeSplatPath: true },
  } = routerOptions;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
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

export { renderWithRouter as render };
