import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders as render } from '../../testUtils';
import { CongratsView } from '../../../components/game/CongratsView';

describe('CongratsView', () => {
  const mockOnReplay = jest.fn();
  const mockOnNextSet = jest.fn();

  const defaultProps = {
    currentSetId: 0,
    verbCount: 5,
    correctAnswersCount: 5,
    requiredAnswers: 5,
    onReplay: mockOnReplay,
    onNextSet: mockOnNextSet,
  };

  it('renders congrats message', async () => {
    const { getByText } = await render(<CongratsView {...defaultProps} />);
    expect(getByText(/Onnittelut!/i)).toBeTruthy();
    expect(getByText(/Olet saanut 5 oikeaa vastausta!/i)).toBeTruthy();
  });

  it('calls onReplay when replay button is pressed', async () => {
    const { getByText } = await render(<CongratsView {...defaultProps} />);
    fireEvent.press(getByText(/Pelaa uudelleen/i));
    expect(mockOnReplay).toHaveBeenCalled();
  });

  it('calls onNextSet when next set button is pressed', async () => {
    const { getByText } = await render(<CongratsView {...defaultProps} />);
    fireEvent.press(getByText(/Seuraava setti/i));
    expect(mockOnNextSet).toHaveBeenCalled();
  });
});