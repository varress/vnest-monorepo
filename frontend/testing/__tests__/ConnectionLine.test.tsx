import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnectionLine } from '../../components/game/ConnectionLine';

describe('ConnectionLine', () => {
  it('renders with default props', () => {
    const { toJSON } = render(
      <ConnectionLine
        startPosition={{ x: 0, y: 0 }}
        endPosition={{ x: 100, y: 100 }}
        color="black"
      />
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders with custom color', () => {
    const { toJSON } = render(
      <ConnectionLine
        startPosition={{ x: 10, y: 20 }}
        endPosition={{ x: 30, y: 40 }}
        color="red"
      />
    );
    expect(toJSON()).not.toBeNull();
  });
});