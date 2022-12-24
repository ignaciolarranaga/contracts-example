/** @type {import('ts-jest').JestConfigWithTsJest} */
/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/*.test.ts'],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src'],
  // An alternative API to setting the NODE_PATH env variable, modulePaths is an array of absolute paths to additional locations to search when resolving modules.
  modulePaths: ['<rootDir>/src'],

  // Default timeout of a test in milliseconds.
  testTimeout: 30000,
};
