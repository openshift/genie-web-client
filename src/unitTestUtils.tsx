import { axe } from 'jest-axe';
import { userEvent } from '@testing-library/user-event';
// this sets up the possibility of adding a custom render method
export * from '@testing-library/react';

const user = userEvent.setup();
export { user };

export const checkAccessibility = async (container: HTMLElement | string) =>
  expect(await axe(container)).toHaveNoViolations();
