const { join } = require('path');

module.exports = {
  globalSetup: join(__dirname, './config/jest.setup.ts'),
  collectCoverageFrom: ['**/*.{t,j}s?(x)'],
  coveragePathIgnorePatterns: ['__(.+?)__'],
  verbose: true,
  rootDir: join(__dirname, './src'),
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '.ts$': 'babel-jest'
  },
  testEnvironment: 'node'
};
