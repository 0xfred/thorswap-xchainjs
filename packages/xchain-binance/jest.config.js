module.exports = {
  preset: 'ts-jest',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  setupFilesAfterEnv: ['./jest.setup.js'],
}
