import { describe, test, expect, beforeEach } from 'vitest';
import { main } from './index.js';
import type { MockInput } from './types.js';
import { makeMockExternal } from './test/mock.js';

let mockExt = makeMockExternal({} as MockInput['context']);

const GoodInput1: MockInput = {
  context: {
    repo: {
      owner: 'test',
      repo: 'test',
    },
    payload: {
      pull_request: {
        head: {
          sha: 'deadbeef1234567890cafebabe123',
        },
        labels: [{ name: 'release:minor' }],
        merged: false,
      },
      repository: {
        default_branch: 'main',
      },
    },
  } as unknown as MockInput['context'],
  defaultBump: 'minor',
  prereleasePrefix: 'beta.',
  labelPrefix: 'release:',
};

const GoodInput2: MockInput = {
  context: {
    repo: {
      owner: 'test',
      repo: 'test',
    },
    payload: {
      pull_request: {
        head: {
          sha: 'deadbeef1234567890cafebabe123',
        },
        labels: [{ name: 'release:minor' }, { name: 'release:generate_prerelease' }],
        merged: false,
      },
      repository: {
        default_branch: 'main',
      },
    },
  } as unknown as MockInput['context'],
  defaultBump: 'minor',
  prereleasePrefix: 'beta.',
  labelPrefix: 'release:',
};
const GoodInput3: MockInput = {
  context: {
    repo: {
      owner: 'test',
      repo: 'test',
    },
    payload: {
      pull_request: {
        head: {
          sha: 'deadbeef1234567890cafebabe123',
        },
        labels: [{ name: 'release:minor' }, { name: 'release:generate_prerelease' }],
        merged: true,
      },
      repository: {
        default_branch: 'main',
      },
    },
  } as unknown as MockInput['context'],
  defaultBump: 'minor',
  prereleasePrefix: 'beta.',
  labelPrefix: 'release:',
};

const BadInput1: MockInput = {
  context: {
    repo: {
      owner: 'test',
      repo: 'test',
    },
    payload: {
      pull_request: {
        head: {
          sha: 'deadbeef1234567890cafebabe123',
        },
        labels: [{ name: 'release:minor' }, { name: 'release:major' }],
        merged: false,
      },
      repository: {
        default_branch: 'main',
      },
    },
  } as unknown as MockInput['context'],
  defaultBump: 'minor',
  prereleasePrefix: 'beta.',
  labelPrefix: 'release:',
};

describe('Action Main', () => {
  beforeEach(() => {
    mockExt = undefined as unknown as typeof mockExt;
  });

  // Context: The mock API returns the last version is v0.5.9
  test('Success case. No prerelease', async () => {
    mockExt = makeMockExternal(GoodInput1.context);
    await expect(main(mockExt, GoodInput1)).resolves.toBeUndefined();
    expect(mockExt.setFailed).not.toHaveBeenCalled();
    expect(mockExt.setOutput).toHaveBeenCalledWith('major', 0);
    expect(mockExt.setOutput).toHaveBeenCalledWith('minor', 6);
    expect(mockExt.setOutput).toHaveBeenCalledWith('patch', 0);
    expect(mockExt.setOutput).toHaveBeenCalledWith('prerelease', false);
    expect(mockExt.setOutput).toHaveBeenCalledWith('suffix', undefined);
    expect(mockExt.setOutput).toHaveBeenCalledWith('lastMainTag', '0.5.9');
  });

  test('Success case. With prerelease', async () => {
    mockExt = makeMockExternal(GoodInput2.context);
    await expect(main(mockExt, GoodInput2)).resolves.toBeUndefined();
    expect(mockExt.setFailed).not.toHaveBeenCalled();
    expect(mockExt.setOutput).toHaveBeenCalledWith('major', 0);
    expect(mockExt.setOutput).toHaveBeenCalledWith('minor', 6);
    expect(mockExt.setOutput).toHaveBeenCalledWith('patch', 0);
    expect(mockExt.setOutput).toHaveBeenCalledWith('prerelease', true);
    expect(mockExt.setOutput).toHaveBeenCalledWith('suffix', 'beta.deadbee');
    expect(mockExt.setOutput).toHaveBeenCalledWith('string', '0.6.0-beta.deadbee');
    expect(mockExt.setOutput).toHaveBeenCalledWith('lastMainTag', '0.5.9');
  });
  test('Success case. Merged with prerelease', async () => {
    mockExt = makeMockExternal(GoodInput3.context);
    await expect(main(mockExt, GoodInput3)).resolves.toBeUndefined();
    expect(mockExt.setFailed).not.toHaveBeenCalled();
    expect(mockExt.setOutput).toHaveBeenCalledWith('major', 0);
    expect(mockExt.setOutput).toHaveBeenCalledWith('minor', 6);
    expect(mockExt.setOutput).toHaveBeenCalledWith('patch', 0);
    expect(mockExt.setOutput).toHaveBeenCalledWith('prerelease', false);
    expect(mockExt.setOutput).toHaveBeenCalledWith('suffix', undefined);
    expect(mockExt.setOutput).toHaveBeenCalledWith('string', '0.6.0');
    expect(mockExt.setOutput).toHaveBeenCalledWith('lastMainTag', '0.5.9');
  });

  test('Fail case: Multiple tags', async () => {
    mockExt = makeMockExternal(BadInput1.context);
    await expect(main(mockExt, BadInput1)).resolves.toBeUndefined();
    expect(mockExt.setFailed).toHaveBeenCalledWith(
      'Multiple applicable labels found on the active pull request. ' +
        'Please only use one of the following labels: release:major, ' +
        'release:minor, release:patch'
    );
  });
});
