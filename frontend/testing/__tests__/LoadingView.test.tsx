import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingView } from '@/components/game/LoadingView';

describe('LoadingView', () => {
  it('renders loading indicator', () => {
    const { getByTestId } = render(<LoadingView />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});