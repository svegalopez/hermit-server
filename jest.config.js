module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'test/coverage',
  rootDir: 'src',
  setupFiles: [
    "./test/setup/createDb.ts"
  ]
};