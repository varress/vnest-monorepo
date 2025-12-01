import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameView } from '@/components/game/GameView';

describe('GameView', () => {
  const mockSubjects = [{ id: 1, value: 'Alice', type: "Agent" as const }];
  const mockObjects = [{ id: 2, value: 'Ball', type: "Patient" as const }];
  const mockVerb = { id: 3, value: 'Throws', type: "Verb" as const, groupId: 0, groupName: '' };
  const mockOnConnect = jest.fn();
  const mockCorrectPairs: Array<{ subjectId: number; objectId: number }> = [];

  it('renders without crashing', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        correctPairs={mockCorrectPairs}
        onConnect={mockOnConnect}
        feedback={null}
      />
    );
    expect(getByText(/Yhdistä oikeat parit verbille/)).toBeTruthy();
  });

  it('renders subject cards', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        correctPairs={mockCorrectPairs}
        onConnect={mockOnConnect}
        feedback={null}
      />
    );
    expect(getByText('Alice')).toBeTruthy();
  });

  it('renders object cards', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        correctPairs={mockCorrectPairs}
        onConnect={mockOnConnect}
        feedback={null}
      />
    );
    expect(getByText('Ball')).toBeTruthy();
  });

  it('renders verb card', () => {
    const { getAllByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        correctPairs={mockCorrectPairs}
        onConnect={mockOnConnect}
        feedback={null}
      />
    );
    // Verb appears multiple times (in sentence and as card)
    expect(getAllByText('Throws').length).toBeGreaterThan(0);
  });

  it('shows correct feedback', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        correctPairs={mockCorrectPairs}
        onConnect={mockOnConnect}
        feedback="Oikein!"
      />
    );
    expect(getByText('Oikein!')).toBeTruthy();
  });

  it('shows incorrect feedback', () => {
    const { getByText } = render(
      <GameView
        subjects={mockSubjects}
        objects={mockObjects}
        currentVerb={mockVerb}
        correctPairs={mockCorrectPairs}
        onConnect={mockOnConnect}
        feedback="Väärin!"
      />
    );
    expect(getByText('Väärin!')).toBeTruthy();
  });
});