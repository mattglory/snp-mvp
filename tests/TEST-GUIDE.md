# SNP Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Watch mode (auto-run on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

## Test Structure

### 1. Integration Tests (`integration-user-journey.test.ts`)
**Purpose**: End-to-end user flows
**Coverage**:
- ✅ Full deposit → allocate → harvest → withdraw lifecycle
- ✅ Multi-user concurrent operations
- ✅ Strategy rebalancing
- ✅ Emergency pause/resume
- ✅ Performance fee collection (8%)

### 2. Gas Optimization Tests (`gas-optimization.test.ts`)
**Purpose**: Performance benchmarking
**Thresholds**:
- Deposit: ≤50,000 units
- Withdraw: ≤60,000 units
- Allocate: ≤70,000 units
- Harvest: ≤80,000 units
- Emergency withdraw: ≤65,000 units
- Pause/unpause: ≤10,000 units

**Automatically flags**:
- Operations using >80% of threshold
- Gas cost regressions between versions
- Variance across different input sizes

### 3. Chaos Tests (`chaos-testing.test.ts`)
**Purpose**: Stress testing & edge cases
**Scenarios**:
- ✅ 10 simultaneous deposits
- ✅ Concurrent deposits + withdrawals
- ✅ Dust amounts (1 micro-STX)
- ✅ Maximum values (u128 max)
- ✅ Zero amount operations
- ✅ Strategy failure simulation
- ✅ Race conditions (pause during operations)
- ✅ Share accounting integrity

## Coverage Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lines | 90% | - |
| Functions | 90% | - |
| Branches | 85% | - |
| Statements | 90% | - |

Run `npm run test:coverage` to generate report at `./coverage/index.html`

## Test Patterns

### First Depositor Protection Test
```typescript
it("should protect against first depositor attack", () => {
  const result = simnet.callPublicFn(
    "vault-stx-v2",
    "deposit",
    [Cl.uint(1500_000000), Cl.uint(0)],
    user1
  );
  
  // Check dead shares burned
  const deadShares = simnet.callReadOnlyFn(
    "vault-stx-v2",
    "get-balance-of",
    [Cl.principal("SP000000000000000000002Q6VF78")],
    user1
  );
  
  expect(deadShares.result).toBe(Cl.uint(1000));
});
```

### Slippage Protection Test
```typescript
it("should enforce minimum output on withdrawals", () => {
  const minOutput = 490_000000; // Accept 2% slippage
  
  const result = simnet.callPublicFn(
    "vault-stx-v2",
    "withdraw",
    [
      Cl.uint(500_000000), 
      Cl.uint(minOutput),
      Cl.uint(simnet.blockHeight + 10)
    ],
    user1
  );
  
  const received = Number(Cl.uint(result.result));
  expect(received).toBeGreaterThanOrEqual(minOutput);
});
```

### Gas Cost Verification
```typescript
it("should measure operation gas cost", () => {
  const result = simnet.callPublicFn(...);
  const gasCost = result.events[0]?.cost || 0;
  
  expect(gasCost).toBeLessThanOrEqual(THRESHOLD);
  console.log(`✓ Gas: ${gasCost} (threshold: ${THRESHOLD})`);
});
```

## Writing New Tests

### 1. Add test file
```bash
# Create new test
touch tests/new-feature.test.ts
```

### 2. Use this template
```typescript
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

describe("Feature Name", () => {
  it("should do something", () => {
    const result = simnet.callPublicFn(
      "contract-name",
      "function-name",
      [Cl.uint(123)],
      deployer
    );
    
    expect(result.result).toBeOk(Cl.uint(123));
  });
});
```

### 3. Run your test
```bash
npm run test:watch
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Debugging Tests

### Enable verbose output
```bash
npm test -- --reporter=verbose
```

### Run single test file
```bash
npm test integration-user-journey
```

### Run specific test
```bash
npm test -- -t "should complete full lifecycle"
```

### Debug mode
```bash
node --inspect-brk ./node_modules/.bin/vitest run
```

## Common Issues

### Issue: "simnet is not defined"
**Fix**: Add `import { initSimnet } from "@hirosystems/clarinet-sdk";`

### Issue: Tests timeout
**Fix**: Increase timeout in vitest.config.ts:
```typescript
testTimeout: 60000 // 60 seconds
```

### Issue: Coverage below threshold
**Fix**: Add tests for uncovered code paths, check report:
```bash
npm run test:coverage
open coverage/index.html
```

## Best Practices

✅ **DO**:
- Test both success and failure cases
- Use descriptive test names
- Test edge cases (zero, max, dust amounts)
- Verify state changes (balances, shares, assets)
- Check error codes match expected values

❌ **DON'T**:
- Skip error path testing
- Use hardcoded addresses (use `accounts.get()`)
- Leave commented-out code
- Test implementation details (test behavior)
- Forget to test permissions/auth

## Pre-Deployment Checklist

Before mainnet launch, verify:

- [ ] All tests passing (100%)
- [ ] Coverage ≥90% for core contracts
- [ ] Gas costs within thresholds
- [ ] Chaos tests pass (stress conditions)
- [ ] Integration tests cover full user journey
- [ ] Emergency scenarios tested
- [ ] Multi-user scenarios validated
- [ ] Fee calculations verified
- [ ] Slippage protection working
- [ ] First depositor protection active

## Resources

- Clarinet SDK Docs: https://docs.hiro.so/clarinet
- Vitest Docs: https://vitest.dev
- Clarity Reference: https://docs.stacks.co/clarity

---

**Questions?** Open an issue or check the main README.md
