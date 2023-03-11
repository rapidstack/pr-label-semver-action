import { describe, test, expect } from 'vitest';
import { sayHello } from './hello.js';

describe('hello', () => {
  test('sayHello', () => {
    expect(sayHello()).toBe('Hello, world!');
  });
});
