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
