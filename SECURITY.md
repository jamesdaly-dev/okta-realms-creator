# Security Documentation

This document outlines the security measures implemented in the Okta Realms Creator application.

## ⚠️ Important Notice

This is a **proof of concept** application and is **NOT officially supported by Okta**. Before deploying:
- Complete a security audit
- Penetration testing recommended
- Review all code with your security team
- Configure proper access controls

## 🔒 Implemented Security Measures

### 1. JWT Token Validation

**What it does:**
- Validates all API requests have a valid Okta access token
- Verifies token signature and expiration
- Ensures tokens are issued by your specific Okta tenant

**How it works:**
- Backend validates JWT on every API call
- Uses `@okta/jwt-verifier` to cryptographically verify tokens
- Rejects expired or tampered tokens

**Configuration required:**
Add to `backend/.env`:
```
OKTA_DOMAIN=your-domain.okta.com
OKTA_CLIENT_ID=your-spa-client-id
```

### 2. Authorization Role Checking

**What it does:**
- Verifies authenticated users have permission to create realms
- Checks user's group membership for admin privileges

**How it works:**
- After authentication, checks if user belongs to admin groups
- Configured admin groups in `authMiddleware.ts`:
  ```typescript
  const adminGroups = [
    'RealmAdmins',
    'Administrators',
    'Everyone', // TEMPORARY - remove in production!
  ];
  ```

**⚠️ IMPORTANT - Before Production:**
1. Remove `'Everyone'` from admin groups list
2. Create a dedicated `RealmAdmins` group in Okta
3. Assign only authorized users to this group

**To configure:**
1. In Okta Admin Console → Directory → Groups
2. Create group named `RealmAdmins`
3. Assign authorized users to this group
4. Edit `backend/src/middleware/authMiddleware.ts`:
   ```typescript
   const adminGroups = [
     'RealmAdmins',
     'Administrators',
   ];
   ```

### 3. Input Validation & Sanitization

**What it protects against:**
- CSV injection attacks (Excel formula injection)
- Regex injection in realm assignment expressions
- Malformed domain names
- XSS attempts
- Invalid email addresses

**Validations performed:**
- **Organization names**: 2-100 chars, alphanumeric + common business characters
- **Domain names**: Valid FQDN format, 4-253 chars, proper TLD
- **Email addresses**: RFC-compliant email validation
- **Descriptions**: 0-500 chars, sanitized for special characters
- **CSV injection**: Detects and blocks formulas (=, +, -, @, |)

**How it works:**
- All CSV data validated before processing
- Invalid rows rejected with detailed error messages
- Special regex characters escaped in expressions
- Domain names validated as proper FQDNs

## 🔐 Additional Security Best Practices

### Okta Configuration

1. **Create least-privilege API token:**
   - Go to Security → API → Tokens
   - Create custom admin role with ONLY:
     - Realm management permissions
     - Read/write realm assignments
   - Do NOT use super admin token

2. **Configure trusted origins:**
   - Security → API → Trusted Origins
   - Add your frontend domain
   - Enable CORS for your specific domain only

3. **Set up group-based access:**
   - Create `RealmAdmins` group
   - Assign only authorized users
   - Use principle of least privilege

### Application Configuration

1. **Environment variables:**
   - Never commit `.env` files
   - Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
   - Rotate API tokens regularly (90 days recommended)

2. **HTTPS enforcement:**
   - Always use HTTPS in production
   - Configure HSTS headers
   - Use valid SSL certificates

3. **CORS configuration:**
   - Restrict to specific frontend domain
   - Never use wildcard (*) in production

## 🛡️ Security Checklist

Before deploying, ensure:

### Okta Configuration
- [ ] Created dedicated `RealmAdmins` group
- [ ] Assigned only authorized INTERNAL users to admin group
- [ ] Created least-privilege API token (not super admin)
- [ ] Configured trusted origins for your domain
- [ ] Set up MFA requirement for admin users
- [ ] Configured session timeout policies

### Application Configuration
- [ ] Removed `'Everyone'` from admin groups in code
- [ ] Using HTTPS with valid certificates
- [ ] Environment variables in secrets manager (not .env files)
- [ ] CORS restricted to specific domain (no wildcards)
- [ ] API token rotation schedule configured
- [ ] Security headers configured (Helmet.js)