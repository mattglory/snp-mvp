# Contributing to SNP

Thank you for considering contributing to SNP! This guide will help you get started.

## Code of Conduct

- Be respectful and constructive
- Focus on code quality and security
- Test thoroughly before submitting
- Document all changes

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/snp-mvp.git
cd snp-mvp
npm install
```

### 2. Create Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Development Workflow

```bash
# Compile contracts
clarinet check

# Run tests continuously
npm run test:watch

# Check coverage
npm run test:coverage
```

## Contribution Guidelines

### Smart Contracts

**Requirements:**
- Must compile with zero errors (`clarinet check`)
- Minimum 90% test coverage
- Follow Clarity best practices
- Include inline documentation

**Before Submitting:**
```bash
clarinet check                  # Must pass
npm run test:all                # All tests pass
npm run test:gas                # Gas benchmarks pass
npm run test:coverage           # Check coverage
```

### Testing Standards

**Required for all PRs:**
- Unit tests for new functions
- Integration tests for user flows
- Gas optimization tests for expensive operations
- Chaos tests for edge cases

**Test Categories:**
- `integration-user-journey.test.ts` - Complete user flows
- `gas-optimization.test.ts` - Performance benchmarks
- `chaos-testing.test.ts` - Stress & edge cases
- `vault-*.test.ts` - Individual vault tests

### Code Style

**Clarity Contracts:**
```clarity
;; Good: Clear naming, documented
(define-public (deposit (amount uint) (min-shares uint))
  "Deposits STX and mints vault shares
   @param amount - STX amount to deposit
   @param min-shares - Minimum shares expected (slippage protection)
   @returns (response uint uint) - Shares minted or error"
  (let ((shares (calculate-shares amount)))
    (ok shares)))

;; Bad: Unclear naming, no docs
(define-public (d (a uint) (m uint))
  (ok (calc a)))
```

**TypeScript Tests:**
```typescript
// Good: Descriptive test names
it("should handle first depositor attack protection correctly", () => {
  // Test implementation
});

// Bad: Vague test names  
it("test deposit", () => {
  // Test implementation
});
```

### Documentation

**Required:**
- Inline comments for complex logic
- Function documentation (purpose, params, returns)
- README updates for new features
- Test documentation for test suites

### Git Workflow

**Commit Messages:**
```bash
# Good
feat: Add emergency withdrawal function to vaults
fix: Correct share calculation rounding error
test: Add chaos tests for concurrent operations
docs: Update API reference with new endpoints

# Bad
update stuff
fix bug
changes
```

**Format:**
```
type: Short description (50 chars max)

Detailed explanation if needed:
- What changed
- Why it changed  
- Impact on users/system

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Test additions/changes
- `docs`: Documentation
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

## Pull Request Process

### 1. Pre-Submit Checklist

```bash
- [ ] All tests pass (`npm test`)
- [ ] Coverage ≥90% (`npm run test:coverage`)
- [ ] Contracts compile (`clarinet check`)
- [ ] Gas benchmarks pass (`npm run test:gas`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No console.logs or debugging code
- [ ] Branch is up to date with main
```

### 2. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Gas benchmarks pass
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex sections
- [ ] Documentation updated
- [ ] No warnings generated
- [ ] Tests added/updated
- [ ] Coverage maintained

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Related Issues
Fixes #[issue number]
```

### 3. Review Process

**All PRs require:**
- Passing CI/CD checks
- Code review approval
- No merge conflicts
- Up-to-date documentation

**Review Focus:**
- Security vulnerabilities
- Gas optimization
- Code clarity
- Test coverage
- Edge case handling

## Security

### Reporting Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

**Instead:**
1. Email: mattglory@proton.me (PGP key available)
2. Discord DM: @geoglory
3. Use GitHub Security Advisories

**Expected Response:**
- Acknowledgment within 48 hours
- Status update within 7 days
- Fix timeline communicated
- Credit in SECURITY.md (if desired)

### Security Review Checklist

Before submitting security-sensitive changes:

```bash
- [ ] No private keys/secrets in code
- [ ] Reentrancy guards where needed
- [ ] Integer overflow protection
- [ ] Access control checks
- [ ] Input validation
- [ ] Error handling
- [ ] Event logging
- [ ] Rate limiting (if applicable)
```

## Development Tips

### Quick Commands

```bash
# Run specific test
npx vitest run tests/integration-user-journey.test.ts

# Watch mode for TDD
npm run test:watch

# Coverage with UI
npm run test:coverage:ui

# Check specific contract
clarinet check contracts/vault-stx-v2.clar

# Deploy to devnet
clarinet integrate
```

### Common Issues

**Tests fail with BOM error:**
```bash
npm run fix:bom
```

**Coverage too low:**
- Add missing test cases
- Remove dead code
- Test edge cases

**Gas benchmarks fail:**
- Optimize expensive operations
- Review loop complexity
- Consider caching

### Project Structure

```
snp-mvp/
├── contracts/           # Clarity smart contracts
│   ├── vault-*.clar    # Vault contracts
│   └── strategies/     # Strategy contracts
├── tests/              # Test files
│   ├── *.test.ts      # TypeScript tests
│   └── *.clar         # Clarity tests
├── frontend/           # React frontend
├── docs/              # Documentation
└── PRIVATE/           # Private dev notes (not in repo)
```

## Questions?

- **Discord**: Join our community
- **GitHub Issues**: For bugs and features
- **Discussions**: For questions and ideas

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SNP! 🚀
