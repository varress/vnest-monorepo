/** @type {import('jest').Config} */
module.exports = {
  rootDir: '../',
  preset: 'jest-expo',
  testEnvironment: 'jsdom',

  transform: {'^.+\\.tsx?$': 'ts-jest'}, // Allow use of TS files
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
 
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {'^@/(.*)$': '<rootDir>/$1'},

  transformIgnorePatterns: [
    "node_modules/(?!(expo|react-native|@react-native|expo-modules-core|@expo|expo-router)/)"
  ]
};
