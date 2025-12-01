import React from 'react';
import { renderWithProviders as render } from '../../testUtils';
import { LoadingView } from '../../../components/game/LoadingView';

describe('LoadingView', () => {
  it('renders loading indicator', async () => {
    const { getByTestId } = await render(<LoadingView />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});