### FILENAME ###
 javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  // Optional: if you have global setup/teardown files
  // globalSetup: './src/test-setup.ts',
  // globalTeardown: './src/test-teardown.ts',
};
 