import * as core from '@actions/core';
import * as github from '@actions/github';
import { getActionInput } from './util.js';

const main = async () => {
  try {
    core.debug('Starting Action');

    // Get the input variables from the action
    const context = github.context;
    const defaultBump = getActionInput('default-bump', 'patch');
    const prereleasePrefix = getActionInput('prerelease-prefix', 'rc.');
    const labelPrefix = getActionInput('label-prefix', '');
    const githubToken = core.getInput('github-token');
    const octokit = github.getOctokit(githubToken);

    console.log('context', JSON.stringify(context, null, 2));

    // Get the most recent tag associated with the commit on the main branch

    // Get the labels from the active pull request

    // Resolve the version number based on the labels and the most recent tag

    // Return the resolved version number as an output variable
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  } finally {
    core.debug('Finished Action Run');
  }
};

main();
