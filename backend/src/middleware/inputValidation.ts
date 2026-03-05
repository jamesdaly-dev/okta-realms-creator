import validator from 'validator';

/**
 * Validates and sanitizes organization data from CSV
 */
export function validateOrganization(org: any): { valid: boolean; error?: string; sanitized?: any } {
  // Check required fields
  if (!org.name || !org.domain) {
    return {
      valid: false,
      error: 'Missing required fields: name and domain',
    };
  }

  // Validate organization name
  const sanitizedName = sanitizeName(org.name);
  if (!sanitizedName) {
    return {
      valid: false,
      error: `Invalid organization name: ${org.name}`,
    };
  }

  // Validate domain
  const sanitizedDomain = sanitizeDomain(org.domain);
  if (!sanitizedDomain) {
    return {
      valid: false,
      error: `Invalid domain: ${org.domain}`,
    };
  }

  // Validate description if provided
  if (org.description) {
    org.description = sanitizeDescription(org.description);
  }

  return {
    valid: true,
    sanitized: {
      name: sanitizedName,
      domain: sanitizedDomain,
      description: org.description,
    },
  };
}

/**
 * Sanitizes organization name
 * - Trims whitespace
 * - Removes potentially dangerous characters
 * - Limits length
 */
function sanitizeName(name: string): string | null {
  if (!name || typeof name !== 'string') {
    return null;
  }

  // Trim and normalize whitespace
  let sanitized = name.trim().replace(/\s+/g, ' ');

  // Check length
  if (sanitized.length < 2 || sanitized.length > 100) {
    return null;
  }

  // Remove potentially dangerous characters but allow common business name chars
  // Allow: letters, numbers, spaces, hyphens, apostrophes, periods, ampersands, commas
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-'.,&]/g, '');

  // Check for CSV injection patterns
  if (isCsvInjection(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitizes and validates domain name
 */
function sanitizeDomain(domain: string): string | null {
  if (!domain || typeof domain !== 'string') {
    return null;
  }

  // Trim and convert to lowercase
  let sanitized = domain.trim().toLowerCase();

  // Remove protocol if present
  sanitized = sanitized.replace(/^https?:\/\//, '');

  // Remove path if present
  sanitized = sanitized.split('/')[0];

  // Remove port if present
  sanitized = sanitized.split(':')[0];

  // Check if it's a valid domain format
  // Allow: letters, numbers, dots, hyphens
  if (!/^[a-z0-9.-]+$/.test(sanitized)) {
    return null;
  }

  // Basic domain validation
  // Must have at least one dot and valid TLD
  const parts = sanitized.split('.');
  if (parts.length < 2) {
    return null;
  }

  // Check each part
  for (const part of parts) {
    if (part.length === 0 || part.length > 63) {
      return null;
    }
    // Cannot start or end with hyphen
    if (part.startsWith('-') || part.endsWith('-')) {
      return null;
    }
  }

  // Check total length
  if (sanitized.length < 4 || sanitized.length > 253) {
    return null;
  }

  // Validate using validator library for additional checks
  if (!validator.isFQDN(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitizes email address
 */
function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const sanitized = email.trim().toLowerCase();

  // Validate email format
  if (!validator.isEmail(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitizes description text
 */
function sanitizeDescription(description: string): string {
  if (!description || typeof description !== 'string') {
    return '';
  }

  // Trim and normalize whitespace
  let sanitized = description.trim().replace(/\s+/g, ' ');

  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }

  // Remove potentially dangerous characters
  // Allow: letters, numbers, spaces, common punctuation
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-'.,!?()&]/g, '');

  return sanitized;
}

/**
 * Checks for CSV injection attempts
 * Prevents formulas in Excel/Google Sheets
 */
function isCsvInjection(value: string): boolean {
  if (!value) {
    return false;
  }

  // Check for formula injection patterns
  const dangerousPatterns = [
    /^=/,      // Equals (formula start)
    /^\+/,     // Plus (formula start)
    /^-/,      // Minus (formula start)
    /^@/,      // At (formula start)
    /^\|/,     // Pipe (command injection)
    /^0x/i,    // Hex notation
  ];

  return dangerousPatterns.some(pattern => pattern.test(value.trim()));
}

/**
 * Escapes special regex characters in domain for safe use in expressions
 */
export function escapeRegexChars(domain: string): string {
  // Escape special regex characters: . * + ? ^ $ { } ( ) | [ ] \
  return domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
