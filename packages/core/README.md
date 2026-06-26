# @devguard/core

Core framework for DevGuard quality platform.

## Installation

```bash
npm install @devguard/core
```

## Usage

```typescript
import { DevGuard } from '@devguard/core';

const devguard = new DevGuard(process.cwd());

// Initialize
await devguard.init();

// Run checks
const result = await devguard.check();
console.log(`Score: ${result.overallScore}%`);
```

## CLI

```bash
# Initialize
npx devguard init

# Run checks
devguard check

# Generate report
devguard report --format html
```

## License

MIT
