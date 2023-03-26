import { getActionFromPRLabels, getActionInput, getLatestDefaultBranchTag } from './github.js';
import { external } from './external.js';
import { createSemver, parseSemver } from './util.js';
import type { External, MockInput, Semver } from './types.js';

export const main = async (ext: External, mockInput?: MockInput) => {
  try {
    ext.logDebug('Starting Action');

    // Get the input variables from the action
    const context = ext.getContext();
    const defaultBump = mockInput?.defaultBump ?? (getActionInput(ext, 'default-bump', 'patch') as Semver);
    const prereleasePrefix = mockInput?.prereleasePrefix ?? getActionInput(ext, 'prerelease-prefix', 'rc.');
    const labelPrefix = mockInput?.labelPrefix ?? getActionInput(ext, 'label-prefix', '');

    // Get the most recent tag associated with the commit on the main branch
    const latestTag = await getLatestDefaultBranchTag(ext);
    if (!latestTag) throw new Error("No tags found on the repo's default branch in the last 100 commits!");

    // Get the most recent prerelease tag associated with the commit in the PR that triggered the action
    // TODO

    // Resolve the version number based on the labels and the most recent tag
    const { action, prerelease } = getActionFromPRLabels(ext, labelPrefix, defaultBump);
    const shortSha = context.payload.pull_request?.head.sha.slice(0, 7);
    const prereleaseString = prerelease ? `${prereleasePrefix}${shortSha}` : undefined;
    const newSemver = createSemver(latestTag, action, prereleaseString);

    // Return the resolved version number and other contextual info as output variables
    ext.logDebug(`Resolved new version number: ${newSemver.string}`);

    const { major: lastMaj, minor: lastMin, patch: lastPatch, suffix } = parseSemver(latestTag);
    const output = {
      ...newSemver,
      prerelease,
      lastMainTag: `${lastMaj}.${lastMin}.${lastPatch}${suffix ? `-${suffix}` : ''}`,
    };

    Object.entries(output).forEach(([key, value]) => {
      ext.logDebug(`Setting output variable ${key} to ${value}`);
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

!process.env.VITEST && main(external);
