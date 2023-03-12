import { describe, test, expect } from 'vitest';
import { createSemver, parseSemver } from './util.js';
import type { Semver } from './types.js';

const SemverParseSuccessTestCases = {
  'v1.2.3': { major: 1, minor: 2, patch: 3, suffix: undefined },
  'V1.2.3': { major: 1, minor: 2, patch: 3, suffix: undefined },
  '1.2.3': { major: 1, minor: 2, patch: 3, suffix: undefined },
  '1.2.3-suffix': { major: 1, minor: 2, patch: 3, suffix: 'suffix' },
};

const SemverParseFailTestCases = [, '', '1.2', '1.2.3.4', '1.2.3suffix'] as string[];
type CreateSemverT = [string, Semver, string | undefined];

const SemverCreateTestCases = [
  { input: ['v1.2.3', 'major'], expected: { string: '2.0.0', major: 2, minor: 0, patch: 0, suffix: undefined } },
  { input: ['v1.2.3', 'minor'], expected: { string: '1.3.0', major: 1, minor: 3, patch: 0, suffix: undefined } },
  { input: ['v1.2.3', 'patch'], expected: { string: '1.2.4', major: 1, minor: 2, patch: 4, suffix: undefined } },
  {
    input: ['v1.2.3', 'major', 'rc.abcdef0'],
    expected: { string: '2.0.0-rc.abcdef0', major: 2, minor: 0, patch: 0, suffix: 'rc.abcdef0' },
  },
  {
    input: ['v1.2.3', 'minor', 'rc.abcdef0'],
    expected: { string: '1.3.0-rc.abcdef0', major: 1, minor: 3, patch: 0, suffix: 'rc.abcdef0' },
  },
  {
    input: ['v1.2.3', 'patch', 'rc.abcdef0'],
    expected: { string: '1.2.4-rc.abcdef0', major: 1, minor: 2, patch: 4, suffix: 'rc.abcdef0' },
  },
];

describe('Utility Functions', () => {
  describe('parseSemver()', () => {
    Object.entries(SemverParseSuccessTestCases).forEach(([testCase, expectedResult]) => {
      test('success cases', () => {
        expect(parseSemver(testCase)).toEqual(expectedResult);
      });
    });

    SemverParseFailTestCases.forEach((testCase) => {
      test('fail cases', () => {
        expect(() => parseSemver(testCase)).toThrow();
      });
    });
  });

  describe('createSemver()', () => {
    SemverCreateTestCases.forEach(({ input, expected }) => {
      test('success cases', () => {
        expect(createSemver(...(input as CreateSemverT))).toEqual(expected);
      });
    });

    SemverParseFailTestCases.forEach((testCase) => {
      test('fail cases', () => {
        expect(() => createSemver(testCase, 'major')).toThrow();
      });
    });
  });
});
