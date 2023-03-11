import * as core from '@actions/core';

const main = async () => {
  try {
    core.debug('Starting Action');

    // Throw if event is not of type workflow_dispatch or pull_request?

    // Get the most recent tag associated with the commit on the main branch

    // Get the labels from the active pull request

    // Resolve the version number based on the labels and the most recent tag

    // Return the resolved version number as an output variable

    console.log('Hello World');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  } finally {
    core.debug('Finished Action Run');
  }
};

main();
