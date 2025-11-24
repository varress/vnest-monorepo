import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FeedbackView } from '../../components/game/FeedbackView';

describe('FeedbackView', () => {
  const mockSubject = { id: 1, value: 'Alice', type: "Agent" as const };
  const mockObject = { id: 2, value: 'Ball', type: "Patient" as const };
  const mockVerb = { id: 3, value: 'Throws', type: "Verb" as const, groupId: 0, groupName: '' };
  const mockOnContinue = jest.fn();
  const mockOnReset = jest.fn();

  const defaultProps = {
    feedback: 'Great job!',
    currentVerbIndex: 0,
    totalVerbs: 1,
    selectedSubject: mockSubject,
    selectedObject: mockObject,
    currentVerb: mockVerb,
    correctAnswersCount: 1,
    requiredAnswers: 2,
    onContinue: mockOnContinue,
    onReset: mockOnReset,
  };

  it('renders feedback text', () => {
    const { getByText } = render(<FeedbackView {...defaultProps} />);
    expect(getByText('Great job!')).toBeTruthy();
  });

  it('renders with empty feedback', () => {
    const { getByText } = render(<FeedbackView {...defaultProps} feedback="" />);
    expect(getByText('')).toBeTruthy();
  });

  it('calls onContinue when Jatka is pressed', () => {
    const { getByText } = render(<FeedbackView {...defaultProps} feedback="✅ Correct!" />);
    fireEvent.press(getByText('Jatka'));
    expect(mockOnContinue).toHaveBeenCalled();
  });

  it('calls onReset when Yritä uudelleen is pressed', () => {
    const { getByText } = render(<FeedbackView {...defaultProps} feedback="❌ Incorrect!" />);
    fireEvent.press(getByText('Yritä uudelleen'));
    expect(mockOnReset).toHaveBeenCalled();
  });
});