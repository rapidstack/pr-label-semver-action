import { context } from '@actions/github';
import { external } from './external.js';

export type Semver = 'major' | 'minor' | 'patch';
export type External = typeof external;
export type MockInput = {
  context: typeof context;
  defaultBump: Semver;
  prereleasePrefix: string;
  labelPrefix: string;
};
