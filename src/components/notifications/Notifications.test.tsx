import React from 'react';
import { render, screen } from '../../unitTestUtils';
import { Notifications } from './Notifications';

describe('Notifications', () => {
  it('displays a list of notifications on initial render', () => {
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
