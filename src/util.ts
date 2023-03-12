/**
 * Will parse a semver in following formats:
 * v1.2.3
 * V1.2.3
 * 1.2.3
 * 1.2.3-suffix
 */
export const parseSemver = (semver: string) => {
  if (!semver.match(/^(v|V)?\d+\.\d+\.\d+(-\w+)?$/)) {
    throw new Error(`Invalid semver: ${semver}`);
  }

  let sv = semver.toLowerCase();
  if (sv.startsWith('v')) {
    sv = sv.slice(1);
  }

  const [major, minor, tail] = sv.split('.');
  const [patch, suffix] = tail.split('-');

  return {
    major: parseInt(major),
    minor: parseInt(minor),
    patch: parseInt(patch),
    suffix,
  };
};

/**
 * Will create a semver based upon current state, bump type, and optional prerelease suffix
 */
export const createSemver = (current: string, bump: 'major' | 'minor' | 'patch', prerelease?: string) => {
  let { major, minor, patch } = parseSemver(current);

  switch (bump) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor += 1;
      patch = 0;
      break;
    case 'patch':
      patch += 1;
      break;
    default:
      throw new Error(`Invalid semver bump type: ${bump}. Must be one of: major, minor, or patch.`);
  }

  return {
    string: `${major}.${minor}.${patch}${prerelease ? `-${prerelease}` : ''}`,
    major,
    minor,
    patch,
    suffix: prerelease,
  };
};
