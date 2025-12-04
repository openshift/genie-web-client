import React from 'react';
import { render, screen } from '@testing-library/react';
import Notifications from './Notifications';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Notifications', () => {
  it('renders a list of notifications', () => {
    render(
      <React.Fragment>
        <Notifications />
      </React.Fragment>,
    );

    const drawer = screen.queryByLabelText(/notifications/i);
    expect(drawer).toBeInTheDocument();

    // The list should be present with at least one listitem
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);
  });
});
