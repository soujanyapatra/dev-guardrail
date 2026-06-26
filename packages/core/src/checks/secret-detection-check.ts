import { BaseCheck } from './base-check';
import { CheckResult, CheckContext, Category, Severity, Issue } from '../types/index';
import { FileSystem } from '../utils/file-system';

/**
 * Detects hardcoded secrets, API keys, tokens, and credentials
 */
export class SecretDetectionCheck extends BaseCheck {
  name = 'secret-detection';
  category = Category.SECURITY;
  description = 'Detects hardcoded secrets, API keys, passwords, and tokens';

  private readonly SECRET_PATTERNS = [
    // API Keys and Tokens
    { 
      pattern: /['"]?[A-Za-z0-9_-]*api[_-]?key['"]?\s*[:=]\s*['"]\s*[A-Za-z0-9_\-]{20,}['"]?/gi,
      name: 'API Key',
      severity: Severity.ERROR
    },
    {
      pattern: /['"]?[A-Za-z0-9_-]*token['"]?\s*[:=]\s*['"]\s*[A-Za-z0-9_\-\.]{20,}['"]?/gi,
      name: 'Authentication Token',
      severity: Severity.ERROR
    },
    {
      pattern: /['"]?[A-Za-z0-9_-]*secret['"]?\s*[:=]\s*['"]\s*[A-Za-z0-9_\-]{20,}['"]?/gi,
      name: 'Secret Key',
      severity: Severity.ERROR
    },
    
    // AWS Keys
    {
      pattern: /AKIA[0-9A-Z]{16}/g,
      name: 'AWS Access Key',
      severity: Severity.ERROR
    },
    {
      pattern: /aws[_-]?secret[_-]?access[_-]?key['"]?\s*[:=]\s*['"][A-Za-z0-9/+=]{40}['"]/gi,
      name: 'AWS Secret Key',
      severity: Severity.ERROR
    },
    
    // Private Keys
    {
      pattern: /-----BEGIN (RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----/g,
      name: 'Private Key',
      severity: Severity.ERROR
    },
    
    // Database Passwords
    {
      pattern: /['"]?DB_PASSWORD['"]?\s*[:=]\s*['"][^'"]{8,}['"]/gi,
      name: 'Database Password',
      severity: Severity.ERROR
    },
    {
      pattern: /mysql:\/\/[^:]+:[^@]+@/gi,
      name: 'MySQL Connection String with Password',
      severity: Severity.ERROR
    },
    {
      pattern: /postgres:\/\/[^:]+:[^@]+@/gi,
      name: 'PostgreSQL Connection String with Password',
      severity: Severity.ERROR
    },
    
    // JWT Tokens
    {
      pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
      name: 'JWT Token',
      severity: Severity.WARNING
    },
    
    // GitHub Token
    {
      pattern: /gh[pousr]_[A-Za-z0-9]{36,}/g,
      name: 'GitHub Token',
      severity: Severity.ERROR
    },
    
    // Slack Token
    {
      pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/g,
      name: 'Slack Token',
      severity: Severity.ERROR
    },
    
    // Generic Password Patterns
    {
      pattern: /['"]?password['"]?\s*[:=]\s*['"][^'"\s]{6,}['"]/gi,
      name: 'Hardcoded Password',
      severity: Severity.ERROR
    },
    
    // API URLs with Keys
    {
      pattern: /https?:\/\/[^\s]*[?&](api_key|apikey|key|token)=[A-Za-z0-9_\-]{10,}/gi,
      name: 'URL with API Key',
      severity: Severity.ERROR
    },
  ];

  private readonly SAFE_PATTERNS = [
    // Common safe patterns to skip
    /password.*example/i,
    /password.*placeholder/i,
    /password.*test/i,
    /password.*dummy/i,
    /password.*sample/i,
    /['"]password['"]/i, // Just the word "password"
    /['"]token['"]/i,    // Just the word "token"
    /api[_-]?key.*null/i,
    /token.*null/i,
    /process\.env\./i,   // Environment variables
    /\$_ENV\[/i,         // PHP environment variables
    /config\(/i,         // Laravel config
    /getenv\(/i,         // Get environment variable
  ];

  async run(context: CheckContext): Promise<CheckResult> {
    const [issues, duration] = await this.measureTime(async () => {
      const issues: Issue[] = [];
      
      // Check code files (exclude common safe files)
      const files = context.files.filter(file => {
        const lower = file.toLowerCase();
        return !lower.includes('test') &&
               !lower.includes('spec') &&
               !lower.includes('mock') &&
               !lower.includes('.example') &&
               !lower.includes('.sample') &&
               !lower.includes('node_modules') &&
               !lower.includes('.git');
      });

      for (const file of files) {
        const fullPath = FileSystem.join(context.projectPath, file);
        const content = await FileSystem.readFile(fullPath);
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Skip comments
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || 
              trimmed.startsWith('#') || 
              trimmed.startsWith('*') ||
              trimmed.startsWith('/*')) {
            return;
          }

          // Check if line matches safe patterns (skip if it does)
          if (this.SAFE_PATTERNS.some(pattern => pattern.test(line))) {
            return;
          }

          // Check against secret patterns
          for (const { pattern, name, severity } of this.SECRET_PATTERNS) {
            const regex = new RegExp(pattern);
            const match = regex.exec(line);
            
            if (match) {
              // Additional validation: skip if it's just variable names
              const matchedText = match[0];
              if (matchedText.length < 15 && !matchedText.includes('-----BEGIN')) {
                continue;
              }

              issues.push(
                this.createIssue({
                  severity,
                  category: this.category,
                  message: `Potential hardcoded ${name} detected`,
                  file,
                  line: index + 1,
                  column: match.index + 1,
                  rule: 'no-secrets',
                  suggestion: 'Use environment variables or a secrets manager instead of hardcoding credentials',
                  link: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
                })
              );
            }
          }
        });
      }

      return issues;
    });

    return this.createResult(issues.length === 0, issues, duration, {
      filesChecked: context.files.length,
      patternsChecked: this.SECRET_PATTERNS.length,
    });
  }
}
