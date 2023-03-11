import type { External } from './external.js';

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

export const getLatestDefaultBranchTag = async (ext: External) => {
  ext.logDebug('Searching last 100 commits from the default branch for a tag.');

  const octokit = ext.getOctokit(ext.getToken());
  const context = ext.getContext();

  const defaultBranchName = context.payload.base.ref as string;
  ext.logDebug('Default branch for repo: ' + defaultBranchName);

  const commits = await octokit.rest.repos.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    sha: defaultBranchName,
    per_page: 100,
  });
  const commitHashes = commits.data.map(({ sha }) => sha);
  ext.logDebug('Last 100 commit hashes on the default branch: ' + JSON.stringify(commitHashes, null, 2));

  const tags = await octokit.rest.repos.listTags({
    owner: context.repo.owner,
    repo: context.repo.repo,
    per_page: 100,
  });
  const tagMap = tags.data.reduce((acc, { name, commit }) => {
    acc[commit.sha] = name;
    return acc;
  }, {} as Record<string, string>);
  ext.logDebug('Last 100 tags and their related commit hashes: ' + JSON.stringify(tagMap, null, 2));

  const latestTag = commitHashes.find((hash) => tagMap[hash]);

  if (latestTag) ext.logDebug('Determined latest tag on the default branch is: ' + tagMap[latestTag]);
  else ext.logDebug('No tags found on the default branch in the last 100 commits.');

  return latestTag ? tagMap[latestTag] : undefined;
};
