import { describe, test, expect } from 'vitest';
import { parseSemver } from './common.js';

const SemverSuccessTestCases = {
  'v1.2.3': { major: 1, minor: 2, patch: 3, suffix: undefined },
  'V1.2.3': { major: 1, minor: 2, patch: 3, suffix: undefined },
  '1.2.3': { major: 1, minor: 2, patch: 3, suffix: undefined },
  '1.2.3-suffix': { major: 1, minor: 2, patch: 3, suffix: 'suffix' },
};

const SemverFailTestCases = [, '', '1.2', '1.2.3.4', '1.2.3suffix'] as string[];

describe('Utility Functions', () => {
  describe('parseSemver()', () => {
    Object.entries(SemverSuccessTestCases).forEach(([testCase, expectedResult]) => {
      test('success cases', () => {
        expect(parseSemver(testCase)).toEqual(expectedResult);
      });
    });

    SemverFailTestCases.forEach((testCase) => {
      test('fail cases', () => {
        expect(parseSemver(testCase)).toThrow();
      });
    });
  });
});
