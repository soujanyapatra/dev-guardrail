# Supported File Types - dev-guardrail v0.3.0

## JavaScript/TypeScript Files

All JavaScript and TypeScript checks now scan these file types:

### Supported Extensions:
- ✅ `.js` - JavaScript
- ✅ `.mjs` - ES Module JavaScript
- ✅ `.cjs` - CommonJS JavaScript
- ✅ `.ts` - TypeScript
- ✅ `.jsx` - React JavaScript
- ✅ `.tsx` - React TypeScript
- ✅ `.vue` - Vue.js Single File Components
- ✅ `.svelte` - Svelte Components

### Frameworks Covered:
- React (`.jsx`, `.tsx`)
- Vue 2/3 (`.vue`)
- Svelte (`.svelte`)
- Next.js (all JS/TS extensions)
- Nuxt (`.vue`)
- Angular (`.ts`)
- Node.js (all JS/TS extensions)

### What's Checked:
- 🔒 Secret detection
- 🛡️ Security patterns (XSS, SQL injection, eval, etc.)
- 🐛 Console.log and debugger statements
- ⚠️ Error handling patterns
- 📝 Naming conventions
- 📏 File size (>700 lines)

---

## PHP Files

All PHP checks now scan these file types:

### Supported Extensions:
- ✅ `.php` - PHP files
- ✅ `.blade.php` - Laravel Blade templates

### Frameworks Covered:
- Laravel (`.php`, `.blade.php`)
- Symfony (`.php`)
- CodeIgniter (`.php`)
- WordPress (`.php`)
- Drupal (`.php`)
- Pure PHP projects

### What's Checked:
- 🔒 Secret detection
- 🛡️ Security patterns (SQL injection, XSS, command injection, weak hashing)
- 🐛 Debug statements (dd, dump, var_dump, print_r)
- ✅ PHP syntax validation (`.php` files only, not `.blade.php`)
- 📏 Long methods (>50 lines)
- ⚠️ Error handling patterns
- 📝 Naming conventions (PSR-1)

---

## File Pattern Examples

### JavaScript/TypeScript Checks Will Scan:
```
src/components/Button.vue          ✅ Vue component
src/App.svelte                     ✅ Svelte component  
src/pages/index.tsx                ✅ React TypeScript
src/api/users.ts                   ✅ TypeScript
src/utils/helpers.js               ✅ JavaScript
src/config.mjs                     ✅ ES Module
server.cjs                         ✅ CommonJS
```

### PHP Checks Will Scan:
```
app/Models/User.php                ✅ Laravel Model
app/Http/Controllers/*.php         ✅ Controllers
resources/views/welcome.blade.php  ✅ Blade templates
app/Services/PaymentService.php    ✅ Service classes
routes/web.php                     ✅ Route files
database/migrations/*.php          ✅ Migrations
config/app.php                     ✅ Config files
```

---

## Excluded Files

These are automatically skipped:

### Test Files:
- `*.test.js`, `*.test.ts`
- `*.spec.js`, `*.spec.ts`
- `**/__tests__/**`

### Build/Dependencies:
- `node_modules/**`
- `vendor/**`
- `dist/**`
- `build/**`

### Version Control:
- `.git/**`
- `.gitignore` (scanned by secret detection only)

### Sample Files:
- `*.example.*`
- `*.sample.*`
- `*.template.*`

---

## Comprehensive Coverage

### Mixed Laravel + Vue Project:
```
✅ PHP Backend:
   app/**/*.php
   routes/**/*.php
   database/**/*.php
   resources/views/**/*.blade.php

✅ Vue Frontend:
   resources/js/**/*.vue
   resources/js/**/*.js
   resources/js/**/*.ts

Result: Full-stack security and quality checks!
```

### React + Node.js API:
```
✅ Backend:
   src/api/**/*.ts
   src/services/**/*.ts
   src/models/**/*.ts

✅ Frontend:
   src/components/**/*.tsx
   src/pages/**/*.tsx
   src/hooks/**/*.ts

Result: Complete JavaScript/TypeScript coverage!
```

### Pure PHP Project:
```
✅ All PHP Files:
   src/**/*.php
   includes/**/*.php
   templates/**/*.php
   
Result: Comprehensive PHP security and quality checks!
```

---

## Real-World Examples

### What Gets Checked:

**Laravel Blade Template** (`resources/views/dashboard.blade.php`):
- ✅ Unescaped Blade output `{!! $var !!}`
- ✅ Debug statements `dd($user)`
- ✅ Hardcoded secrets in inline PHP
- ✅ Security patterns

**Vue Component** (`src/components/UserCard.vue`):
- ✅ console.log in `<script>` section
- ✅ innerHTML in methods
- ✅ Hardcoded API keys
- ✅ Error handling
- ✅ Naming conventions

**Svelte Component** (`src/App.svelte`):
- ✅ All JavaScript/TypeScript checks
- ✅ Security patterns
- ✅ Secret detection

**PHP Model** (`app/Models/User.php`):
- ✅ SQL injection patterns
- ✅ Weak password hashing (md5, sha1)
- ✅ Long methods
- ✅ Naming conventions (PSR-1)

---

## Language Detection

dev-guardrail automatically detects your project type:

```bash
$ npx devguard check

dev-guardrail - Quality Scan
──────────────────────────────────
Detecting: Laravel + Vue
Languages: PHP, JavaScript
PHP project detected - enabling PHP checks
──────────────────────────────────
```

**Detection includes:**
- Laravel (composer.json with laravel/framework)
- Vue (package.json with vue)
- React (package.json with react)
- Node.js (package.json detected)
- TypeScript (tsconfig.json detected)

---

## Summary

| Language | File Types | Checks | Status |
|----------|-----------|---------|--------|
| JavaScript | `.js`, `.mjs`, `.cjs` | 9 checks | ✅ Full |
| TypeScript | `.ts` | 9 checks | ✅ Full |
| React | `.jsx`, `.tsx` | 9 checks | ✅ Full |
| Vue | `.vue` | 9 checks | ✅ Full |
| Svelte | `.svelte` | 9 checks | ✅ Full |
| PHP | `.php` | 8 checks | ✅ Full |
| Blade | `.blade.php` | 7 checks* | ✅ Full |

*Blade templates skip PHP syntax check (run on `.php` files only)

**Total Coverage:**
- 11 comprehensive checks
- 8 file extensions
- Multiple frameworks
- Full-stack projects

---

## Perfect For

✅ **Laravel + Vue/React** - Complete backend + frontend coverage  
✅ **Laravel + Inertia** - PHP and JS in harmony  
✅ **MEVN/MERN Stack** - Full JavaScript stack  
✅ **Svelte/SvelteKit** - Modern framework support  
✅ **WordPress/Drupal** - PHP CMS projects  
✅ **Mixed Monorepos** - Multiple tech stacks in one repo  

---

*Need support for more file types? Check out the [Contributing Guide](./CONTRIBUTING.md) to add custom checks!*
