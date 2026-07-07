# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take the security of GastroCore seriously. If you believe you've found a
security vulnerability, please report it by emailing us at **security@gastrocore.com**.

Do **not** report security vulnerabilities through public GitHub issues.

Please include as much detail as possible:

- Type of vulnerability
- Full path(s) of affected source file(s)
- Steps to reproduce
- Proof-of-concept or exploit code (if possible)

We will acknowledge receipt within 48 hours and strive to send a more detailed
response within 5 business days. We will keep you informed of the remediation
process.

## Disclosure Policy

- We will coordinate disclosure with you
- We will acknowledge contributions when we publish the fix
- We ask that you do not disclose the vulnerability publicly until we have had
  a reasonable time to address it

## Security Practices

- JWT tokens with short expiration (15 min access, 7 day refresh with rotation)
- bcrypt password hashing (salt rounds: 10)
- SHA-256 hashed refresh tokens with family tracking
- Request validation via Zod schemas
- Tenant isolation via automatic Prisma `$extends` filtering
- CORS restricted to configured `FRONTEND_URL`
- Helmet security headers applied globally
- Rate limiting on auth endpoints
