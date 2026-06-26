# dev-guardrail Checks Reference

Complete list of all built-in checks in dev-guardrail v0.3.0.

## 🔒 Security Checks (Critical Priority)

### 1. Secret Detection Check
**Rule:** `no-secrets`  
**Category:** Security  
**Severity:** Error/Warning

Detects hardcoded secrets, API keys, passwords, and tokens in your codebase.

**Detects:**
- API keys and tokens
- AWS access keys and secret keys
- Private keys (RSA, DSA, EC, OpenSSH, PGP)
- Database passwords and connection strings
- JWT tokens
- GitHub tokens (`ghp_`, `gho_`, `ghu_`, `ghs_`)
- Slack tokens (`xoxb-`, `xoxa-`, etc.)
- Hardcoded passwords
- URLs with embedded API keys

**Example Issues:**
```javascript
// ❌ BAD
const API_KEY = "sk_live_EXAMPLE_KEY_1234567890abcdef";
const dbUrl = "mysql://user:SecretPass123@localhost/db";

// ✅ GOOD
const API_KEY = process.env.STRIPE_API_KEY;
const dbUrl = process.env.DATABASE_URL;
```

**Links:**
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

### 2. Security Pattern Check
**Rule:** Various (see below)  
**Category:** Security  
**Severity:** Error/Warning

Detects common security vulnerabilities and anti-patterns.

#### JavaScript/TypeScript Security Checks:

**2.1 Eval Usage (`no-eval`)**
```javascript
// ❌ DANGEROUS
eval(userInput);
new Function(userInput)();

// ✅ SAFE
// Refactor to avoid dynamic code execution
```

**2.2 XSS Vulnerabilities (`no-inner-html`, `dangerous-html`)**
```javascript
// ❌ XSS RISK
element.innerHTML = userInput;
<div dangerouslySetInnerHTML={{__html: data}} />

// ✅ SAFE
element.textContent = userInput;
// Or sanitize with DOMPurify
```

**2.3 SQL Injection (`sql-injection`)**
```javascript
// ❌ SQL INJECTION
db.query("SELECT * FROM users WHERE id = " + userId);

// ✅ SAFE - Use parameterized queries
db.query("SELECT * FROM users WHERE id = ?", [userId]);
```

**2.4 Sensitive Data in localStorage (`no-sensitive-localstorage`)**
```javascript
// ❌ INSECURE
localStorage.setItem('token', authToken);

// ✅ SECURE
// Use httpOnly cookies or secure session storage
```

**2.5 Open Redirect (`open-redirect`)**
```javascript
// ❌ OPEN REDIRECT RISK
window.location = userProvidedUrl;

// ✅ SAFE
// Validate and whitelist redirect URLs
```

#### PHP Security Checks:

**2.6 SQL Injection (`sql-injection`, `raw-sql-injection`)**
```php
// ❌ SQL INJECTION
DB::select("SELECT * FROM users WHERE id = " . $id);
DB::raw("WHERE status = " . $status);

// ✅ SAFE
DB::select("SELECT * FROM users WHERE id = ?", [$id]);
DB::table('users')->where('id', $id)->get();
```

**2.7 Eval Usage (`no-eval`)**
```php
// ❌ EXTREMELY DANGEROUS
eval($code);

// ✅ Refactor to avoid eval
```

**2.8 Unsafe Deserialization (`unsafe-unserialize`)**
```php
// ❌ OBJECT INJECTION RISK
$data = unserialize($_POST['data']);

// ✅ SAFE
$data = json_decode($_POST['data'], true);
```

**2.9 Command Injection (`command-injection`)**
```php
// ❌ COMMAND INJECTION
system("ls " . $userInput);

// ✅ SAFE
// Avoid shell commands or use escapeshellarg()
```

**2.10 SSRF Vulnerability (`ssrf-risk`)**
```php
// ❌ SSRF RISK
$content = file_get_contents($userUrl);

// ✅ SAFE
// Validate and whitelist URLs
```

**2.11 Weak Password Hashing (`weak-password-hash`)**
```php
// ❌ INSECURE
$hash = md5($password);
$hash = sha1($password);

// ✅ SECURE
$hash = Hash::make($password); // Laravel
$hash = password_hash($password, PASSWORD_BCRYPT);
```

**2.12 XSS in PHP (`xss-echo`, `blade-unescaped`)**
```php
// ❌ XSS RISK
echo $userInput;
{!! $userInput !!}

// ✅ SAFE
{{ $userInput }} // Laravel Blade (auto-escaped)
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');
```

---

## 📋 Code Quality Checks

### 3. Console Log Check
**Rule:** `no-console`, `no-debugger`  
**Category:** Lint  
**Severity:** Warning (console), Error (debugger)

Detects debugging statements in JavaScript/TypeScript production code.

```javascript
// ❌ Remove before production
console.log("Debug info");
console.debug(data);
debugger;

// ✅ Use proper logging library
logger.info("Info message");
```

---

### 4. PHP Debug Check
**Rule:** `no-debug-statements`  
**Category:** Lint  
**Severity:** Warning

Detects debug statements in PHP code.

```php
// ❌ Remove before production
dd($user);
dump($data);
var_dump($array);
print_r($object);

// ✅ Use Laravel logging
Log::info('User data', ['user' => $user]);
```

---

### 5. Large File Check
**Rule:** `max-lines`, `max-file-size`  
**Category:** Complexity  
**Severity:** Warning

Detects files that are too large and should be split.

**Thresholds:**
- Max lines: 700
- Max size: 100KB

**Suggestion:** Split large files into smaller, focused modules.

---

### 6. PHP Long Method Check
**Rule:** `max-method-length`  
**Category:** Complexity  
**Severity:** Warning

Detects PHP methods that are too long.

**Threshold:** 50 lines per method

```php
// ❌ Too long (>50 lines)
public function processOrder($order) {
    // 80 lines of code...
}

// ✅ Split into smaller methods
public function processOrder($order) {
    $this->validateOrder($order);
    $this->calculateTotal($order);
    $this->applyDiscounts($order);
}
```

---

### 7. Error Handling Check
**Rule:** Various (see below)  
**Category:** Lint  
**Severity:** Warning/Info

Validates proper error handling patterns.

#### JavaScript/TypeScript:

**7.1 Empty Catch Blocks (`no-empty-catch`)**
```javascript
// ❌ Silently swallows errors
try {
    riskyOperation();
} catch (error) {}

// ✅ Handle or log errors
try {
    riskyOperation();
} catch (error) {
    logger.error('Operation failed', error);
}
```

**7.2 Unhandled Promises (`promise-catch`)**
```javascript
// ❌ Missing error handling
api.fetchData().then(data => process(data));

// ✅ Handle rejections
api.fetchData()
    .then(data => process(data))
    .catch(error => handleError(error));
```

**7.3 Async Without Try-Catch (`async-error-handling`)**
```javascript
// ⚠️ Consider error handling
async function loadUser() {
    const user = await api.getUser();
}

// ✅ Proper error handling
async function loadUser() {
    try {
        const user = await api.getUser();
    } catch (error) {
        handleError(error);
    }
}
```

**7.4 Throwing Strings (`throw-error-object`)**
```javascript
// ❌ Don't throw strings
throw "Something went wrong";

// ✅ Throw Error objects
throw new Error("Something went wrong");
```

#### PHP:

**7.5 Empty Catch Blocks (`no-empty-catch`)**
```php
// ❌ Silently swallows exceptions
try {
    riskyOperation();
} catch (Exception $e) {}

// ✅ Log or handle
try {
    riskyOperation();
} catch (Exception $e) {
    Log::error('Operation failed: ' . $e->getMessage());
}
```

**7.6 Generic Exception Catching (`specific-exceptions`)**
```php
// ⚠️ Too broad
catch (Exception $e) {}

// ✅ Catch specific exceptions
catch (ModelNotFoundException $e) {}
catch (ValidationException $e) {}
```

**7.7 Error Suppression (`no-error-suppression`)**
```php
// ❌ Don't suppress errors
@file_get_contents($path);

// ✅ Handle errors properly
if (!file_exists($path)) {
    throw new FileNotFoundException();
}
```

**7.8 Die/Exit Usage (`no-die-exit`)**
```php
// ❌ Abrupt termination
if (!$user) {
    die('User not found');
}

// ✅ Throw exceptions
if (!$user) {
    abort(404, 'User not found');
}
```

---

### 8. Naming Convention Check
**Rule:** Various (see below)  
**Category:** Lint  
**Severity:** Warning/Info

Validates naming conventions across languages.

#### JavaScript/TypeScript:

**8.1 Class Names (`class-name-pascal-case`)**
```javascript
// ❌ Wrong
class userService {}

// ✅ Correct
class UserService {}
```

**8.2 Function Names (`function-name-camel-case`)**
```javascript
// ❌ Don't use snake_case
function get_user_data() {}

// ✅ Use camelCase
function getUserData() {}
```

**8.3 Constant Names (`const-naming`)**
```javascript
// ℹ️ Only use ALL_CAPS for primitives
const API_URL = "https://api.example.com"; // ✅
const USER_DATA = fetchUser(); // ⚠️ Should be userData

// ✅ Better
const API_URL = "https://api.example.com";
const userData = fetchUser();
```

**8.4 Hungarian Notation (`no-hungarian-notation`)**
```javascript
// ℹ️ Avoid Hungarian notation
const strName = "John"; // ⚠️
const arrUsers = []; // ⚠️

// ✅ Use TypeScript types
const name: string = "John";
const users: User[] = [];
```

#### PHP:

**8.5 Class Names (`php-class-name`)**
```php
// ❌ Wrong (PSR-1)
class user_service {}

// ✅ Correct
class UserService {}
```

**8.6 Method Names (`php-method-name`)**
```php
// ❌ Wrong (PSR-1)
public function Get_User_Data() {}

// ✅ Correct
public function getUserData() {}
```

**8.7 Variable Names (`php-variable-name`)**
```php
// ℹ️ Modern PHP prefers camelCase
$user_name = "John"; // ⚠️ Old style

// ✅ Modern style
$userName = "John";
```

**Links:**
- [PSR-1 Basic Coding Standard](https://www.php-fig.org/psr/psr-1/)

---

### 9. PHP Syntax Check
**Rule:** `php-syntax-error`  
**Category:** Lint  
**Severity:** Error

Validates PHP syntax using `php -l`.

Catches syntax errors before runtime:
- Missing semicolons
- Unclosed brackets
- Invalid PHP syntax

---

### 10. TODO Check (Optional)
**Rule:** `todo-comment`  
**Category:** Lint  
**Severity:** Info

Finds TODO/FIXME comments in code.

```javascript
// ℹ️ Tracked
// TODO: Implement error handling
// FIXME: This is a temporary workaround
```

**Note:** Disabled by default. Enable in config:
```yaml
checks:
  todoCheck:
    enabled: true
```

---

## Summary

| Check | Languages | Category | Severity | Always On |
|-------|-----------|----------|----------|-----------|
| Secret Detection | All | Security | Error | ✅ |
| Security Patterns | JS/TS/PHP | Security | Error/Warning | ✅ |
| Console Logs | JS/TS | Lint | Warning | ✅ |
| PHP Debug | PHP | Lint | Warning | ✅ |
| Large Files | All | Complexity | Warning | ✅ |
| Long Methods | PHP | Complexity | Warning | ✅ |
| Error Handling | JS/TS/PHP | Lint | Warning | ✅ |
| Naming Conventions | JS/TS/PHP | Lint | Warning/Info | ✅ |
| PHP Syntax | PHP | Lint | Error | ✅ |
| TODO Comments | All | Lint | Info | ❌ (Optional) |

**Total:** 11 checks (10 always-on + 1 optional)

---

## Configuration

All checks can be customized in `.devguard/config.yaml`:

```yaml
quality:
  minimumScore: 85

checks:
  # Security checks (always recommended)
  secretDetection:
    enabled: true
  
  securityPatterns:
    enabled: true
  
  # Code quality checks
  consoleLog:
    enabled: true
    
  errorHandling:
    enabled: true
    
  namingConvention:
    enabled: true
  
  # Optional
  todoCheck:
    enabled: false
```

---

For more information, see [README.md](./README.md) or [STATUS.md](./STATUS.md).
