import React from 'react';
import { renderWithProviders as render } from '../../testUtils';
import SettingsScreen from '../../../app/(tabs)/settings';

describe('SettingsScreen', () => {
  it('renders settings title', async () => {
    const { getByText } = await render(<SettingsScreen />);
    expect(getByText(/Asetukset/i)).toBeTruthy();
  });
});