module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  setupFiles: ["<rootDir>/.jest/env_vars.js"],
  testEnvironment: "node",
  verbose: true
};