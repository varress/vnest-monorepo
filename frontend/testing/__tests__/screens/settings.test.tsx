import React from 'react';
import { renderWithProviders as render } from '../../testUtils';
import SettingsScreen from '../../../app/(tabs)/settings';

describe('SettingsScreen', () => {
  it('renders settings title', async () => {
    const { getAllByText } = await render(<SettingsScreen />);
    const asetuksetElements = getAllByText(/Asetukset/i);
    expect(asetuksetElements.length).toBeGreaterThan(0);
  });
});