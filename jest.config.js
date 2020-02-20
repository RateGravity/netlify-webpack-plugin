const path = require('path');

module.exports = {
  collectCoverageFrom: ['**/*.ts'],
  coveragePathIgnorePatterns: ['__(.+?)__'],
  rootDir: path.join(__dirname, './src'),
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '.ts$': 'ts-jest'
  },
  verbose: true
};
