import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameView } from '@/components/game/GameView';

describe('GameView', () => {
  const mockSubjects = [{ id: 1, value: 'Alice', type: "Agent" as const }];
  const mockObjects = [{ id: 2, value: 'Ball', type: "Patient" as const }];
  const mockVerb = { id: 3, value: 'Throws', type: "Verb" as const, groupId: 0, groupName: '' };
  const mockOnSelect = jest.fn();

  it('renders without crashing', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        selectedSubject={null}
        selectedObject={null}
        onSelect={mockOnSelect}
      />
    );
    expect(getByText('Yhdistä kortit')).toBeTruthy();
  });

  it('renders selected subject', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        selectedSubject={mockSubjects[0]}
        selectedObject={null}
        onSelect={mockOnSelect}
      />
    );
    expect(getByText('Alice')).toBeTruthy();
  });

  it('renders selected object', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        selectedSubject={null}
        selectedObject={mockObjects[0]}
        onSelect={mockOnSelect}
      />
    );
    expect(getByText('Ball')).toBeTruthy();
  });

  it('renders verb card', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        selectedSubject={null}
        selectedObject={null}
        onSelect={mockOnSelect}
      />
    );
    expect(getByText('Throws')).toBeTruthy();
  });

  it('calls onSelect when subject card is pressed', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        selectedSubject={null}
        selectedObject={null}
        onSelect={mockOnSelect}
      />
    );
    fireEvent.press(getByText('Alice'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockSubjects[0]);
  });

  it('calls onSelect when object card is pressed', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        selectedSubject={null}
        selectedObject={null}
        onSelect={mockOnSelect}
      />
    );
    fireEvent.press(getByText('Ball'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockObjects[0]);
  });
});