import type { Config } from 'jest'

export default <Config>{
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: { '^~/(.*)$': '<rootDir>/$1' },
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: String.raw`.*\.spec\.ts$`,
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
}
