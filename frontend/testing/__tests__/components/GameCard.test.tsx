import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders as render } from '../../testUtils';
import { GameCard } from '../../../components/game/GameCard';

describe('GameCard', () => {
  it('renders correctly', async () => {
    const { getByTestId } = await render(<GameCard text="Test Card" />);
    expect(getByTestId('game-card')).toBeTruthy();
  });

  it('renders with selected state', async () => {
    const { getByTestId } = await render(<GameCard text="Selected Card" isSelected />);
    expect(getByTestId('game-card')).toBeTruthy();
  });

  it('renders with verb variant', async () => {
    const { getByTestId } = await render(<GameCard text="Verb Card" variant="verb" />);
    expect(getByTestId('game-card')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPressMock = jest.fn();
    const { getByTestId } = await render(<GameCard text="Press Card" onPress={onPressMock} />);
    fireEvent.press(getByTestId('game-card'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('applies custom style', async () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = await render(<GameCard text="Styled Card" style={customStyle} />);
    expect(getByTestId('game-card').props.style).toMatchObject(customStyle);
  });

  it('renders the correct text', async () => {
    const { getByText } = await render(<GameCard text="Unique Text" />);
    expect(getByText('Unique Text')).toBeTruthy();
  });
});