import { vi, MockedObject } from 'vitest';
import { External, MockInput } from '../types.js';

const commitResponse = [
  '5a4c2b2bd7dae696b7040d07e0e5b25d8b819c46',
  'cc306a9b90e4a63376ecfd112ac27c60e0ac299e',
  'c813ca80bc28bb36d4b70402e3158c9eec5dbc18',
  '28acd793954f42a390754173c39f45a8df3a6ce4',
  'fd83e09bc120118f066159ba512586954d669b39',
  'fb5520a2b07fb359d4c8ee38f3877e48141b0cb0',
  '8ec6c67b1836ea196007cbce134980ede34134e0',
  '430f1697340a5d4e8d084c90455d74d2160bc701',
  'ae2d8ff89f68bc8d79b58de4fe061ddac1592931',
  'e975bff142a116c0a7a9d2122d89f24e93c6b8c5',
  'abeb3dbbfd1b6ba4c2dd3a15f63ceb23243b7785',
  '96fc1b106ec5a89c4d832e03f45315e1acdac233',
  '9cebeb68ac4a0383056c851b1254d3eb14c62e0a',
  'a9de42427b84c2b611eaf95fc02c6093d927aff9',
  '44d20bb891bed50094878db81155fad704ec1268',
  '8aaf9126d8fefdeeea38f81860bf96f0b1735cef',
  '164c13a48a350efba7740a4f5e4652ed7d9a858e',
  'f0e7e44e91614c40fe148b2067452b0c66e6028f',
  'b821b6fc617bd6df1a9315d343f4c1d798a71bea',
  '3954ddef460a8d476c331a0539318b9742975b1f',
  '8cb8da6f6cca5b43c2b436f7ae598f1499964214',
  'eee8d64615aac054bbb2dde4592285cd0af3af76',
  '6ca1768f734b173596fb5b79130c0551b97f33c9',
  '58eda1df5b35a2f29fc437d676f725dcf1beb35a',
  'ba1cf300b006b6c1cf6b11bfb3edfe6ebd304855',
].map((sha) => ({ sha }));

const tagResponse = Object.entries({
  '6ca1768f734b173596fb5b79130c0551b97f33c9': 'v0.5.9',
  '58eda1df5b35a2f29fc437d676f725dcf1beb35a': 'v0.5.8',
  ba1cf300b006b6c1cf6b11bfb3edfe6ebd304855: 'v0.5.7',
  '1e5ab406cf0e45f18f9f78c6168b086fbb6c013c': 'v0.5.6',
  '746cc23f06968d367cdbd03c4fa804a349ad982c': 'v0.5.5',
  c21a7e6238410d3e233e516c002d64c800c3bd5d: 'v0.5.4',
  '2de9c8a9bb0e9c828c9e89d3711f3709603bd435': 'v0.5.3',
}).map(([sha, tag]) => ({ commit: { sha }, name: tag }));

export const makeMockExternal = (ctx: MockInput['context']) =>
  ({
    logDebug: vi.fn(),
    setFailed: vi.fn(),
    getInput: vi.fn(),
    getToken: vi.fn(),
    getOctokit: () => ({
      rest: {
        repos: {
          listCommits: vi.fn().mockReturnValueOnce({ data: commitResponse }),
          listTags: vi.fn().mockReturnValueOnce({ data: tagResponse }),
        },
      },
    }),
    getContext: vi.fn().mockReturnValue(ctx),
    setOutput: vi.fn(),
  } as unknown as MockedObject<External>);
