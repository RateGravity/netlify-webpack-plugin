const { join } = require('path');

module.exports = {
  collectCoverageFrom: ['**/*.{t,j}s?(x)'],
  coveragePathIgnorePatterns: ['__(.+?)__'],
  verbose: true,
  rootDir: join(__dirname, './src'),
  moduleFileExtensions: ['js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {
    '.js$': 'babel-jest'
  }
};
