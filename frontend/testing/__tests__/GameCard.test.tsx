import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameCard } from '@/components/game/GameCard';

describe('GameCard', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<GameCard text="Test Card" />);
    expect(getByTestId('game-card')).toBeTruthy();
  });

  it('renders with selected state', () => {
    const { getByTestId } = render(<GameCard text="Selected Card" isSelected />);
    expect(getByTestId('game-card')).toBeTruthy();
  });

  it('renders with verb variant', () => {
    const { getByTestId } = render(<GameCard text="Verb Card" variant="verb" />);
    expect(getByTestId('game-card')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<GameCard text="Press Card" onPress={onPressMock} />);
    fireEvent.press(getByTestId('game-card'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(<GameCard text="Styled Card" style={customStyle} />);
    expect(getByTestId('game-card').props.style).toMatchObject(customStyle);
  });

  it('renders the correct text', () => {
    const { getByText } = render(<GameCard text="Unique Text" />);
    expect(getByText('Unique Text')).toBeTruthy();
  });
});