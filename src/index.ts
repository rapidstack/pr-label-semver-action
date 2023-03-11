import { getActionInput, getLatestDefaultBranchTag } from './github.js';
import { ext } from './external.js';

const main = async () => {
  try {
    ext.logDebug('Starting Action');

    // Get the input variables from the action
    const context = ext.getContext();
    const defaultBump = getActionInput(ext, 'default-bump', 'patch');
    const prereleasePrefix = getActionInput(ext, 'prerelease-prefix', 'rc.');
    const labelPrefix = getActionInput(ext, 'label-prefix', '');
    const githubToken = ext.getToken();

    console.log('context', JSON.stringify(context, null, 2));

    // Get the most recent tag associated with the commit on the main branch
    const latestTag = await getLatestDefaultBranchTag(ext);
    console.log('latestTag', latestTag);

    // Get the labels from the active pull request

    // Resolve the version number based on the labels and the most recent tag

    // Return the resolved version number as an output variable
  } catch (error) {
    if (error instanceof Error) {
      ext.setFailed(error.message);
    }
  } finally {
    ext.logDebug('Finished Action Run');
  }
};

main();
