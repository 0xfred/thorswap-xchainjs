module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    bip39: 'bip39',
    stream: 'stream-browserify',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  setupFilesAfterEnv: ['./jest.setup.js'],
}
