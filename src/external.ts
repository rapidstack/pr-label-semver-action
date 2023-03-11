import * as core from '@actions/core';
import * as github from '@actions/github';

/**
 * This is just here to make mocking external calls easier
 */
export const ext = {
  logDebug: core.debug,
  setFailed: core.setFailed,
  getInput: core.getInput,
  getToken: () => core.getInput('github-token'),
  getOctokit: github.getOctokit,
  getContext: () => github.context,
};

export type External = typeof ext;
