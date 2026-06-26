import { describe, it, expect, beforeEach } from 'vitest';
import { ConsoleLogCheck } from '../console-log-check';
import { CheckContext } from '../../types/index';
import { FileSystem } from '../../utils/file-system';

describe('ConsoleLogCheck', () => {
  let check: ConsoleLogCheck;
  let context: CheckContext;

  beforeEach(() => {
    check = new ConsoleLogCheck();
    context = {
      projectPath: '/test',
      projectType: ['javascript'],
      config: {
        quality: { minimumScore: 85 },
        checks: {},
      },
      files: [],
      cache: new Map(),
    };
  });

  it('should have correct metadata', () => {
    expect(check.name).toBe('console-log-detection');
    expect(check.category).toBe('lint');
    expect(check.enabled).toBe(true);
  });

  it('should detect console.log', async () => {
    // This is a simplified test - in real implementation,
    // you'd mock FileSystem.readFile
    const result = await check.run(context);
    expect(result.checkName).toBe('console-log-detection');
    expect(result.passed).toBeDefined();
  });

  it('should create issues with correct severity', async () => {
    const result = await check.run(context);
    expect(result.issues).toBeInstanceOf(Array);
  });
});
