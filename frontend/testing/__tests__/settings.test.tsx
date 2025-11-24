import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsScreen from '../../app/(tabs)/settings';

describe('SettingsScreen', () => {
  it('renders settings title', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/Asetukset/i)).toBeTruthy();
  });
});