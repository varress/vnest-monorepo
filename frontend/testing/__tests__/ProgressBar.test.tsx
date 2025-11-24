import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '../../components/game/ProgressBar';

describe('ProgressBar', () => {
  it('renders progress bar with value', () => {
    const { getByText } = render(<ProgressBar current={5} total={10} />);
    expect(getByText(/Olet suorittanut 5\/10 lauseharjoitusta/i)).toBeTruthy();
  });

  it('renders progress bar at 0%', () => {
    const { getByText } = render(<ProgressBar current={0} total={10} />);
    expect(getByText(/Olet suorittanut 0\/10 lauseharjoitusta/i)).toBeTruthy();
  });

  it('renders progress bar at 100%', () => {
    const { getByText } = render(<ProgressBar current={10} total={10} />);
    expect(getByText(/Olet suorittanut 10\/10 lauseharjoitusta/i)).toBeTruthy();
  });

  it('renders with custom label', () => {
    const { getByText } = render(<ProgressBar current={3} total={10} label="Custom Label" />);
    expect(getByText('Custom Label')).toBeTruthy();
  });
});