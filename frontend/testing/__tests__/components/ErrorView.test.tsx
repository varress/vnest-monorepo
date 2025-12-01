import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorView } from '../../../components/game/ErrorView';

describe('ErrorView', () => {
  const mockOnRetry = jest.fn();
  const mockOnForceReload = jest.fn();

  it('renders error message', () => {
    const { getByText } = render(
      <ErrorView error="Something went wrong!" onRetry={mockOnRetry} onForceReload={mockOnForceReload} />
    );
    expect(getByText(/Something went wrong!/i)).toBeTruthy();
  });

  it('renders with default error message', () => {
    const { getByText } = render(
      <ErrorView onRetry={mockOnRetry} onForceReload={mockOnForceReload} />
    );
    expect(getByText(/Failed to load word data/i)).toBeTruthy();
  });

  it('calls onRetry when Retry is pressed', () => {
    const { getByText } = render(
      <ErrorView error="Test error" onRetry={mockOnRetry} onForceReload={mockOnForceReload} />
    );
    fireEvent.press(getByText('Retry'));
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('calls onForceReload when Force Reload Data is pressed', () => {
    const { getByText } = render(
      <ErrorView error="Test error" onRetry={mockOnRetry} onForceReload={mockOnForceReload} />
    );
    fireEvent.press(getByText('Force Reload Data'));
    expect(mockOnForceReload).toHaveBeenCalled();
  });
});