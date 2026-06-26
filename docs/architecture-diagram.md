# DevGuard Architecture Diagram

## Current Architecture (v0.3.0)

```
┌─────────────────────────────────────────────────────────────┐
│                     dev-guardrail (npm)                     │
│                      @devguard/core                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    CLI Commands                       │ │
│  │  init | check | report | doctor | hooks | score      │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Configuration Manager                    │ │
│  │          (YAML/JSON - .devguard/config.yaml)         │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Project Detector                         │ │
│  │  Auto-detect: Laravel, Vue, React, Next.js, etc.    │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                  Scanner                              │ │
│  │          (Parallel check execution)                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌─────────────────────┬─────────────────┬───────────────┐ │
│  │  Universal Checks   │  JS/TS Checks   │  PHP Checks   │ │
│  ├─────────────────────┼─────────────────┼───────────────┤ │
│  │ • Secret Detection  │ • Console Logs  │ • Debug Stmts │ │
│  │ • Large Files       │ • Error Handle  │ • Syntax      │ │
│  │ • TODO Comments     │ • Naming Conv   │ • Long Method │ │
│  │                     │ • Security      │ • Naming Conv │ │
│  │                     │                 │ • Security    │ │
│  └─────────────────────┴─────────────────┴───────────────┘ │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Scoring Engine                           │ │
│  │    (Weighted score 0-100, Grade A+ to F)             │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Report Generator                         │ │
│  │           HTML | JSON | Markdown                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘

             Usage: npm install -D dev-guardrail
                    npx devguard check
```

---

## Future Architecture (v1.0+)

```
┌─────────────────────────────────────────────────────────────┐
│                  dev-guardrail (Core)                       │
│                   @devguard/core                            │
├─────────────────────────────────────────────────────────────┤
│  • CLI & Configuration                                      │
│  • Plugin System                                            │
│  • Scanner & Scoring                                        │
│  • Universal Checks (secrets, file size, TODO)             │
│  • Basic Language Checks                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ↓                       ↓
┌──────────────────────┐  ┌──────────────────────┐
│  @devguard/javascript│  │   @devguard/php      │
├──────────────────────┤  ├──────────────────────┤
│ • ESLint Integration │  │ • PHPStan            │
│ • TypeScript Checks  │  │ • PHP_CodeSniffer    │
│ • React Hooks        │  │ • Laravel Specific   │
│ • Vue Validation     │  │ • Symfony Checks     │
│ • Import Analysis    │  │ • WordPress Rules    │
└──────────────────────┘  └──────────────────────┘
           ↓                       ↓
┌──────────────────────┐  ┌──────────────────────┐
│  @devguard/python    │  │  @devguard/security  │
├──────────────────────┤  ├──────────────────────┤
│ • Pylint             │  │ • Semgrep            │
│ • MyPy               │  │ • Gitleaks           │
│ • Bandit             │  │ • SAST Tools         │
│ • Django Checks      │  │ • Dependency Audit   │
└──────────────────────┘  └──────────────────────┘

          Usage: npm install -D dev-guardrail @devguard/php
                 npx devguard check
```

---

## Check Execution Flow

```
User runs: npx devguard check
            ↓
┌───────────────────────────────────────┐
│  1. Load Configuration                │
│     (.devguard/config.yaml)           │
└───────────┬───────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│  2. Detect Project Type               │
│     - Laravel? → Enable PHP checks    │
│     - Vue? → Enable JS checks         │
│     - Both? → Enable both             │
└───────────┬───────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│  3. Scan Files                        │
│     - Filter by patterns              │
│     - Exclude node_modules, vendor    │
│     - Group by file type              │
└───────────┬───────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│  4. Run Checks (Parallel)             │
│                                       │
│  ┌─────────┐  ┌─────────┐           │
│  │ Check 1 │  │ Check 2 │  ...      │
│  └────┬────┘  └────┬────┘           │
│       └────────────┴──> Results     │
└───────────┬───────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│  5. Calculate Score                   │
│     - Category weights                │
│     - Issue severities                │
│     - Overall score (0-100)           │
└───────────┬───────────────────────────┘
            ↓
┌───────────────────────────────────────┐
│  6. Display Results                   │
│     - Overall score & grade           │
│     - Category breakdown              │
│     - Issue details with suggestions  │
│     - File paths & line numbers       │
└───────────────────────────────────────┘
```

---

## File Type Routing

```
Scanner detects file extension
            ↓
    ┌───────┴───────┐
    ↓               ↓
.js/.ts/.vue    .php/.blade.php
    ↓               ↓
JavaScript      PHP Checks
Checks          ↓
↓               • PHPDebugCheck
• ConsoleLog    • PHPSyntaxCheck
• ErrorHandle   • PHPLongMethod
• Naming        • SecurityPattern
• Security      • ErrorHandling
                • Naming

        Both types also run:
              ↓
        ┌─────────────┐
        │ Universal   │
        │ Checks      │
        ├─────────────┤
        │ • Secrets   │
        │ • File Size │
        │ • TODOs     │
        └─────────────┘
```

---

## Plugin System (Future)

```
┌─────────────────────────────────────┐
│          Core Plugin Manager        │
└──────────┬──────────────────────────┘
           │
    Loads plugins from:
           │
    ┌──────┴──────────────────────┐
    ↓                             ↓
Built-in                    External
Native Plugin               Plugins
    ↓                             ↓
@devguard/native          package.json:
    ↓                      plugins: [
All core checks             "@devguard/php",
automatically              "@devguard/security"
registered                ]
                                  ↓
                          Plugin implements:
                          interface Plugin {
                            name: string
                            version: string
                            checks: Check[]
                            scoreWeight?: number
                          }
```

---

## Data Flow: From Code to Report

```
Source Code Files
       ↓
  File Scanner
       ↓
  Check Runner  ────>  Check Results
       ↓                    ↓
  Issue Collector           │
       ↓                    │
┌──────────────────┐        │
│  CheckResult[]   │ <──────┘
│                  │
│  {               │
│    checkName     │
│    passed        │
│    issues: [     │
│      {           │
│        file      │
│        line      │
│        message   │
│        severity  │
│      }           │
│    ]             │
│  }               │
└────────┬─────────┘
         ↓
  Scoring Engine
         ↓
┌────────────────────┐
│   ScanResult       │
│                    │
│   overallScore: 88 │
│   grade: "B+"      │
│   checkResults     │
│   summary          │
└────────┬───────────┘
         ↓
   Report Generator
         ↓
    ┌────┴────┐
    ↓         ↓
  HTML      JSON
  Report    Report
```

---

## Security Check Flow

```
File Content
     ↓
Secret Detection
     ↓
┌─────────────────────────────────┐
│ Pattern Matching (20+ patterns) │
│                                  │
│ • API_KEY = "sk_..."            │
│ • password = "..."              │
│ • AKIA[0-9A-Z]{16}              │
│ • -----BEGIN RSA PRIVATE KEY--- │
│ • mysql://user:pass@host        │
└──────────┬──────────────────────┘
           ↓
    Safe Pattern Filter
           ↓
    ┌──────┴──────┐
    ↓             ↓
  False       Potential
  Positive    Secret
    ↓             ↓
  Skip        Report Issue
              with:
              • File path
              • Line number
              • Secret type
              • Suggestion
```

---

## Multi-Language Project Example

```
Laravel + Vue Project
        ↓
Project Detector
        ↓
  Detects: PHP + JavaScript
        ↓
    Scanner scans:
        ↓
┌───────┴───────┐
↓               ↓
Backend         Frontend
Files           Files
↓               ↓
app/**/*.php    resources/js/**/*.vue
routes/*.php    resources/js/**/*.js
resources/      resources/js/**/*.ts
  views/*.blade
        ↓
PHP Checks      JS Checks
↓               ↓
• Debug stmts   • Console logs
• SQL inject    • XSS patterns
• Syntax        • Error handling
• Long methods  • Naming
        ↓               ↓
        └───────┬───────┘
                ↓
         Combined Results
                ↓
         Single Report
                ↓
    Overall Score: 88%
    Files: 156
    Issues: 12
    (8 PHP, 4 JS)
```

---

## Performance Optimization

```
File Discovery
     ↓
┌─────────────────────┐
│ Fast file matching  │
│ (glob patterns)     │
└────────┬────────────┘
         ↓
    File Grouping
         ↓
┌─────────────────────┐
│ Group by extension  │
│ .php → PHP checks   │
│ .js  → JS checks    │
└────────┬────────────┘
         ↓
    Parallel Execution
         ↓
┌─────────────────────┐
│ Run 5 checks at     │
│ once (configurable) │
└────────┬────────────┘
         ↓
    Result Aggregation
         ↓
┌─────────────────────┐
│ Combine all results │
│ Calculate score     │
└─────────────────────┘

    Typical: 2-3 seconds
    for 100-200 files
```

---

## CI/CD Integration

```
Git Push
    ↓
CI Pipeline (GitHub Actions, GitLab CI, etc.)
    ↓
┌────────────────────────────────────┐
│  steps:                            │
│    - checkout                      │
│    - npm ci                        │
│    - npx devguard check --ci       │
│                                    │
│  --ci mode:                        │
│    • Non-zero exit if score < min │
│    • JSON output for parsing      │
│    • No colors (plain text)       │
└────────────┬───────────────────────┘
             ↓
      ┌──────┴──────┐
      ↓             ↓
  Score >= 85   Score < 85
      ↓             ↓
   ✅ Pass       ❌ Fail
   Continue      Block merge
   pipeline      Show issues
```

---

## Summary

### Current (v0.3.0):
- ✅ Monolithic core with all checks
- ✅ Zero configuration
- ✅ Works immediately
- ✅ 11 comprehensive checks
- ✅ Multi-language (JS/TS/PHP)

### Future (v1.0+):
- ✅ Modular plugin architecture
- ✅ External tool integration
- ✅ More languages (Python, Go, Rust)
- ✅ Framework-specific checks
- ✅ Advanced security scanning

---

For more details, see:
- [Package Structure](./package-structure.md)
- [Plugin Development](./plugin-development.md)
- [Architecture Overview](./architecture.md)
