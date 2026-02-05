module.exports = {
  preset: 'react-native',

  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/setup.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-reanimated|react-native-safe-area-context|react-native-screens|@react-navigation|react-native-size-matters|react-native-svg|react-native-gesture-handler|react-native-calendars|react-native-swipe-gestures)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
};
