import type { Semver, External } from './types.js';

/**
 * Gets the value of an action input variable, or defaults to a value. Embeds debug logging.
 */
export const getActionInput = (ext: External, name: string, def: string) => {
  const input = ext.getInput(name, { trimWhitespace: true });
  if (input) {
    ext.logDebug(`Using user-passed input for variable ${name}. (${input})`);
    return input;
  }
  ext.logDebug(`Using default value for variable ${name}. (${def})`);
  return def;
};

/**
 * Determines the default branch of the repo, looks for commits on that branch,
 * and gets the latest tag on that branch.
 */
export const getLatestDefaultBranchTag = async (ext: External) => {
  ext.logDebug('Searching commits from the default branch for a tag.');

  const octokit = ext.getOctokit(ext.getToken());
  const context = ext.getContext();

  const defaultBranchName = context.payload.repository?.default_branch as string;
  ext.logDebug('Default branch for repo: ' + defaultBranchName);

  let page = 1;
  let latestTag: string | undefined;

  ext.logDebug('Fetching tags...');
  const tags = await octokit.rest.repos.listTags({
    owner: context.repo.owner,
    repo: context.repo.repo,
    per_page: 100,
  });

  const tagMap = tags.data.reduce(
    (acc, { name, commit }) => {
      acc[commit.sha] = name;
      return acc;
    },
    {} as Record<string, string>,
  );

  while (!latestTag) {
    ext.logDebug(`Searching commits (page ${page})...`);

    const commits = await octokit.rest.repos.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      sha: defaultBranchName,
      per_page: 100,
      page,
    });

    const commitHashes = commits.data.map(({ sha }) => sha);
    ext.logDebug('Commit hashes on the default branch: ' + JSON.stringify(commitHashes, null, 2));

    ext.logDebug('Tags and their related commit hashes: ' + JSON.stringify(tagMap, null, 2));

    latestTag = commitHashes.find((hash) => tagMap[hash]);

    if (!latestTag) {
      if (commits.data.length < 100) {
        ext.logDebug('No tags found on the default branch in the commits searched.');
        break;
      }
      page++;
    }
  }

  if (latestTag) {
    ext.logDebug('Determined latest tag on the default branch is: ' + tagMap[latestTag]);
    return tagMap[latestTag];
  } else {
    ext.logDebug('No tags found on the default branch in the commits searched.');
    return undefined;
  }
};

/**
 * Gets the labels from the PR, looks for those appropriate for the action, and returns the appropriate semver bump.
 * If no label is found, returns an action following the default bump.
 */
export const getActionFromPRLabels = (ext: External, prefix: string, def: 'major' | 'minor' | 'patch') => {
  ext.logDebug('Getting labels from the active pull request.');

  const context = ext.getContext();
  const merged = context.payload.pull_request?.merged || false;
  const labels = context.payload.pull_request?.labels.map(({ name }: { name: string }) => name.toLowerCase());

  ext.logDebug('Labels on the active pull request: ' + JSON.stringify(labels, null, 2));
  if (merged) ext.logDebug('Pull request is merged, will not generate a prerelease version.');

  const applicableLabels = labels?.filter((label: string) => {
    if (
      label === `${prefix}major` ||
      label === `${prefix}minor` ||
      label === `${prefix}patch` ||
      label === `${prefix}generate_prerelease`
    ) {
      return true;
    }
    return false;
  });
  ext.logDebug('Applicable labels on the active pull request: ' + JSON.stringify(applicableLabels, null, 2));

  // Extract the 'generate_prerelease' label if it exists
  const generatePrerelease = merged ? false : applicableLabels?.includes(`${prefix}generate_prerelease`);
  const remainingLabels = applicableLabels?.filter((label: string) => label !== `${prefix}generate_prerelease`);

  if (remainingLabels?.length > 1) {
    throw new Error(
      `Multiple applicable labels found on the active pull request. Please only use one of the following labels: ${prefix}major, ${prefix}minor, ${prefix}patch`,
    );
  }

  if (remainingLabels?.length === 0) {
    ext.logDebug(
      'No applicable labels found on the active pull request or not operating in a pull request. Using default bump: ' +
        def,
    );
    return {
      action: def,
      prerelease: false,
    };
  }

  return {
    action: remainingLabels?.[0].replace(`${prefix}`, '') as Semver,
    prerelease: generatePrerelease ? true : false,
  };
};
