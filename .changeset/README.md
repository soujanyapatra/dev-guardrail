# Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

## Creating a Changeset

When you make changes that affect the public API or user experience:

```bash
npm run changeset
```

Follow the prompts to:
1. Select which packages changed
2. Choose version bump type (major/minor/patch)
3. Write a summary of changes

## Version Bump Types

- **Major** - Breaking changes
- **Minor** - New features (backwards compatible)
- **Patch** - Bug fixes

## Publishing

```bash
# Update versions
npm run version-packages

# Publish to npm
npm run release
```

## Example Changeset

```markdown
---
"@devguard/core": minor
"@devguard/javascript": patch
---

Added new console.log detection check and fixed TypeScript integration
```
