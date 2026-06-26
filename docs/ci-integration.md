# CI/CD Integration

DevGuard integrates seamlessly with all major CI platforms.

## GitHub Actions

Create `.github/workflows/devguard.yml`:

```yaml
name: DevGuard Quality Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run DevGuard
        run: npx devguard check --ci

      - name: Generate report
        if: always()
        run: npx devguard report --format html

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: devguard-report
          path: reports/

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('reports/summary.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

## GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - quality

devguard:
  stage: quality
  image: node:18
  before_script:
    - npm ci
  script:
    - npx devguard check --ci
    - npx devguard report --format html
  artifacts:
    when: always
    paths:
      - reports/
    reports:
      junit: reports/junit.xml
  cache:
    paths:
      - node_modules/
```

## Bitbucket Pipelines

Create `bitbucket-pipelines.yml`:

```yaml
image: node:18

pipelines:
  default:
    - step:
        name: DevGuard Quality Check
        caches:
          - node
        script:
          - npm ci
          - npx devguard check --ci
          - npx devguard report --format html
        artifacts:
          - reports/**

  pull-requests:
    '**':
      - step:
          name: DevGuard Quality Check
          caches:
            - node
          script:
            - npm ci
            - npx devguard check --ci
            - npx devguard report --format html
          artifacts:
            - reports/**
```

## Azure Pipelines

Create `azure-pipelines.yml`:

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx devguard check --ci
    displayName: 'Run DevGuard'

  - script: npx devguard report --format html
    displayName: 'Generate report'
    condition: always()

  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: 'reports'
      artifactName: 'devguard-report'
    condition: always()
```

## AWS CodeBuild

Create `buildspec.yml`:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - npm ci

  build:
    commands:
      - npx devguard check --ci
      - npx devguard report --format html

artifacts:
  files:
    - 'reports/**/*'
  name: devguard-report

cache:
  paths:
    - 'node_modules/**/*'
```

## Jenkins

Create `Jenkinsfile`:

```groovy
pipeline {
    agent {
        docker {
            image 'node:18'
        }
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Quality Check') {
            steps {
                sh 'npx devguard check --ci'
            }
        }

        stage('Generate Report') {
            steps {
                sh 'npx devguard report --format html'
            }
        }
    }

    post {
        always {
            publishHTML([
                reportDir: 'reports',
                reportFiles: 'report.html',
                reportName: 'DevGuard Report'
            ])
        }
    }
}
```

## CircleCI

Create `.circleci/config.yml`:

```yaml
version: 2.1

orbs:
  node: circleci/node@5.1.0

jobs:
  quality-check:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Run DevGuard
          command: npx devguard check --ci
      - run:
          name: Generate Report
          command: npx devguard report --format html
          when: always
      - store_artifacts:
          path: reports
          destination: devguard-report

workflows:
  quality:
    jobs:
      - quality-check
```

## Configuration

### Fail on Low Score

Set minimum score in `.devguard/config.yaml`:

```yaml
quality:
  minimumScore: 85
  failOnError: true
```

When running in CI mode, DevGuard will exit with code 1 if score is below threshold.

### CI-Specific Settings

```yaml
ci:
  # Fail on any errors
  failOnError: true

  # Show detailed output
  verbose: true

  # Generate reports
  reports:
    - json
    - html
    - markdown
```

## Status Badges

Add a badge to your README:

### GitHub Actions

```markdown
![DevGuard](https://github.com/username/repo/workflows/DevGuard%20Quality%20Check/badge.svg)
```

### GitLab

```markdown
![DevGuard](https://gitlab.com/username/repo/badges/main/pipeline.svg)
```

## Tips

1. **Cache dependencies** - Use CI caching for faster builds
2. **Run on PRs** - Catch issues before merging
3. **Upload reports** - Artifact reports for later review
4. **Comment on PRs** - Automated feedback on pull requests
5. **Fail fast** - Exit early on critical issues
6. **Parallel jobs** - Run DevGuard alongside tests
7. **Scheduled scans** - Daily quality checks

## Environment Variables

```bash
# CI mode
DEVGUARD_CI=true

# Custom config path
DEVGUARD_CONFIG=.devguard/config.yaml

# Minimum score
DEVGUARD_MIN_SCORE=85

# Report format
DEVGUARD_REPORT_FORMAT=html,json
```

## Example PR Comment

DevGuard can post quality results as PR comments:

```markdown
## DevGuard Quality Report

**Overall Score:** 88% (Grade B+)

### Summary
- Files Scanned: 127
- Issues Found: 24
- Errors: 2 ❌
- Warnings: 18 ⚠️
- Info: 4 ℹ️

### Category Scores
- Security: 95% ✅
- Type Safety: 90% ✅
- Linting: 85% ⚠️
- Coverage: 82% ⚠️

[View Full Report](artifacts/devguard-report/report.html)
```
