export default {
  testEnvironment: 'jsdom', // Simulates a browser environment for React
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest', // Transpile JS/JSX files
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Setup file for custom matchers
};