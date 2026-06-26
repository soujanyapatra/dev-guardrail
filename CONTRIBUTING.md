# Contributing to DevGuard

Thank you for your interest in contributing to DevGuard! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/devguard.git
   cd devguard
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build all packages:
   ```bash
   npm run build
   ```

## Development Workflow

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run tests:
   ```bash
   npm test
   ```

4. Run linting:
   ```bash
   npm run lint
   ```

5. Commit your changes (use conventional commits):
   ```bash
   git commit -m "feat: add new feature"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. Create a Pull Request

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Project Structure

```
devguard/
├── packages/
│   ├── core/           # Core framework
│   ├── javascript/     # JavaScript/TypeScript plugin
│   ├── python/         # Python plugin
│   ├── php/            # PHP plugin
│   └── ...             # Other plugins
├── docs/               # Documentation
└── examples/           # Example projects
```

## Creating a Plugin

Plugins must implement the `Plugin` interface:

```typescript
import { Plugin, BaseCheck } from '@devguard/core';

export const plugin: Plugin = {
  name: '@devguard/my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',
  checks: [
    new MyCustomCheck(),
  ],
  scoreWeight: 0.1,
};
```

### Creating a Check

Checks must extend `BaseCheck`:

```typescript
import { BaseCheck, CheckResult, CheckContext, Category } from '@devguard/core';

export class MyCustomCheck extends BaseCheck {
  name = 'my-check';
  category = Category.LINT;
  description = 'My custom check';

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      // Your check logic here
      return [];
    });

    return this.createResult(issues.length === 0, issues, duration);
  }
}
```

## Testing

- Write unit tests for all new features
- Aim for >95% code coverage
- Place tests in `__tests__` directories or as `.test.ts` files

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to all public APIs
- Update documentation in `docs/` directory

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update documentation
3. Ensure all tests pass
4. Ensure code follows the style guide (run `npm run lint`)
5. Get approval from at least one maintainer
6. Squash commits if requested

## Release Process

Releases are managed using [Changesets](https://github.com/changesets/changesets):

```bash
# Create a changeset
npm run changeset

# Version packages
npm run version-packages

# Publish
npm run release
```

## Questions?

Open an issue or start a discussion on GitHub.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
