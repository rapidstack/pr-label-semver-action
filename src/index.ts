import { getActionFromPRLabels, getActionInput, getLatestDefaultBranchTag } from './github.js';
import { ext } from './external.js';
import { createSemver } from './util.js';

const main = async () => {
  try {
    ext.logDebug('Starting Action');

    // Get the input variables from the action
    const context = ext.getContext();
    const defaultBump = getActionInput(ext, 'default-bump', 'patch') as 'major' | 'minor' | 'patch';
    const prereleasePrefix = getActionInput(ext, 'prerelease-prefix', 'rc.');
    const labelPrefix = getActionInput(ext, 'label-prefix', '');

    console.log('context', JSON.stringify(context, null, 2));

    // Get the most recent tag associated with the commit on the main branch
    const latestTag = await getLatestDefaultBranchTag(ext);
    if (!latestTag) throw new Error("No tags found on the repo's default branch in the last 100 commits!");

    // Resolve the version number based on the labels and the most recent tag
    const { action, prerelease } = getActionFromPRLabels(ext, labelPrefix, defaultBump);

    const shortSha = context.payload.pull_request?.head.sha.slice(0, 7);
    const prereleaseString = prerelease ? `${prereleasePrefix}${shortSha}` : undefined;
    const newSemver = createSemver(latestTag, action, prereleaseString);

    // Return the resolved version number as an output variable
    ext.logDebug(`Resolved new version number: ${newSemver.string}`);
    Object.entries(newSemver).forEach(([key, value]) => {
      ext.setOutput(key, value);
    });
  } catch (error) {
    if (error instanceof Error) {
      ext.setFailed(error.message);
    }
  } finally {
    ext.logDebug('Finished Action Run');
  }
};

main();
