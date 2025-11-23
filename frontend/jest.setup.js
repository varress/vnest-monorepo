import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';
import { Animated } from 'react-native';

// Fake timers for all tests
jest.useFakeTimers();

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

// Suppress Animated warnings in tests
Animated.timing = (value, config) => ({
  start: jest.fn(),
});