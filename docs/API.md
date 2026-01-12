# SNP API Reference

## Core Vault Functions

### deposit

Deposits STX and mints vault shares based on current share price.

```clarity
(define-public (deposit (amount uint) (min-shares uint))
```

**Parameters:**
- `amount` - STX amount to deposit (micro-STX, 6 decimals)
- `min-shares` - Minimum shares expected (slippage protection)

**Returns:** `(response uint uint)`
- Success: Number of shares minted
- Error: Error code

**Requirements:**
- `amount > 0`
- Vault not paused
- First deposit ≥ 1,000 STX (prevents first depositor attack)

**Example:**
```typescript
// Deposit 1500 STX, accept any share amount (first deposit)
const result = await contract.call("deposit", [
  Cl.uint(1500_000000),
  Cl.uint(0)
]);
```

**Gas Cost:** ~45,000 units

---

### withdraw

Burns vault shares and returns underlying STX.

```clarity
(define-public (withdraw (shares uint) (min-output uint) (deadline uint))
```

**Parameters:**
- `shares` - Number of shares to burn
- `min-output` - Minimum STX to receive (slippage protection)
- `deadline` - Block height deadline for transaction

**Returns:** `(response uint uint)`
- Success: Amount of STX returned
- Error: Error code

**Requirements:**
- `shares > 0`
- `min-output` protection honored
- `deadline` not passed
- User has sufficient shares
- Vault not paused

**Example:**
```typescript
// Withdraw 500 shares, expect ≥490 STX, deadline in 10 blocks
const result = await contract.call("withdraw", [
  Cl.uint(500_000000),
  Cl.uint(490_000000),
  Cl.uint(currentBlock + 10)
]);
```

**Gas Cost:** ~55,000 units

---

### allocate-to-strategy

Allocates vault funds to an approved strategy (owner only).

```clarity
(define-public (allocate-to-strategy 
  (strategy principal) 
  (amount uint))
```

**Parameters:**
- `strategy` - Principal address of strategy contract
- `amount` - STX amount to allocate

**Returns:** `(response bool uint)`

**Requirements:**
- Caller is owner
- Strategy is whitelisted
- Allocation within 5-50% limits
- Vault has sufficient unallocated funds

**Example:**
```typescript
const result = await contract.call("allocate-to-strategy", [
  Cl.principal("ST1...strategy-stx-stacking"),
  Cl.uint(750_000000)
]);
```

**Gas Cost:** ~65,000 units

---

### harvest-strategy

Harvests yields from strategy, collects performance fee (owner only).

```clarity
(define-public (harvest-strategy (strategy principal))
```

**Parameters:**
- `strategy` - Principal address of strategy to harvest

**Returns:** `(response uint uint)`
- Success: Profit harvested (after 8% fee)
- Error: Error code

**Fee Structure:**
- 8% performance fee on profits
- Collected to contract, claimable by owner

**Example:**
```typescript
const result = await contract.call("harvest-strategy", [
  Cl.principal("ST1...strategy-stx-stacking")
]);
```

**Gas Cost:** ~75,000 units

---

### emergency-withdraw-from-strategy

Withdraws all funds from strategy without harvesting (owner only).

```clarity
(define-public (emergency-withdraw-from-strategy 
  (strategy principal))
```

**Parameters:**
- `strategy` - Principal address of strategy

**Returns:** `(response uint uint)`

**Use Cases:**
- Strategy contract compromised
- Emergency situations
- Strategy rebalancing

**Example:**
```typescript
const result = await contract.call("emergency-withdraw-from-strategy", [
  Cl.principal("ST1...strategy-zest-v1")
]);
```

**Gas Cost:** ~60,000 units

---

### pause / unpause

Circuit breaker controls (owner only).

```clarity
(define-public (pause))
(define-public (unpause))
```

**Effects when paused:**
- ❌ Deposits blocked
- ❌ Withdrawals blocked
- ✅ Emergency functions allowed
- ✅ Read functions allowed

**Example:**
```typescript
// Pause vault
await contract.call("pause", []);

// Resume operations
await contract.call("unpause", []);
```

**Gas Cost:** ~8,000 units each

---

## Read-Only Functions

### get-total-assets

Returns total STX controlled by vault (deployed + undeployed).

```clarity
(define-read-only (get-total-assets))
```

**Returns:** `uint` - Total assets in micro-STX

**Example:**
```typescript
const total = await contract.readOnly("get-total-assets", []);
// Returns: 2500000000 (2,500 STX)
```

---

### get-share-price

Returns current price per share in STX.

```clarity
(define-read-only (get-share-price))
```

**Returns:** `uint` - Price with 6 decimals

**Formula:** `(total-assets * 1e6) / total-supply`

**Example:**
```typescript
const price = await contract.readOnly("get-share-price", []);
// Returns: 1050000 (1.05 STX per share, 5% yield generated)
```

---

### get-balance-of

Returns share balance for specific address.

```clarity
(define-read-only (get-balance-of (who principal)))
```

**Parameters:**
- `who` - Principal address to check

**Returns:** `uint` - Share balance

**Example:**
```typescript
const balance = await contract.readOnly("get-balance-of", [
  Cl.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")
]);
```

---

### get-total-supply

Returns total shares minted (including dead shares).

```clarity
(define-read-only (get-total-supply))
```

**Returns:** `uint` - Total share supply

---

### get-strategy-assets

Returns amount allocated to specific strategy.

```clarity
(define-read-only (get-strategy-assets (strategy principal)))
```

**Parameters:**
- `strategy` - Strategy contract principal

**Returns:** `uint` - Assets in strategy

**Example:**
```typescript
const allocated = await contract.readOnly("get-strategy-assets", [
  Cl.principal("ST1...strategy-stx-stacking")
]);
```

---

### preview-deposit

Calculates shares to be minted for given deposit amount.

```clarity
(define-read-only (preview-deposit (assets uint)))
```

**Parameters:**
- `assets` - STX amount to simulate depositing

**Returns:** `uint` - Estimated shares

**Example:**
```typescript
const shares = await contract.readOnly("preview-deposit", [
  Cl.uint(1000_000000)
]);
// Returns: 952380 shares (if share price is 1.05)
```

---

### preview-withdraw

Calculates STX to be returned for burning given shares.

```clarity
(define-read-only (preview-withdraw (shares uint)))
```

**Parameters:**
- `shares` - Shares to simulate burning

**Returns:** `uint` - Estimated STX output

**Example:**
```typescript
const stx = await contract.readOnly("preview-withdraw", [
  Cl.uint(500_000000)
]);
// Returns: 525000000 (525 STX if share price is 1.05)
```

---

## Error Codes

```clarity
;; Access Control
(define-constant ERR-NOT-OWNER (err u101))
(define-constant ERR-UNAUTHORIZED (err u103))

;; State Checks
(define-constant ERR-ZERO-AMOUNT (err u102))
(define-constant ERR-PAUSED (err u104))

;; Strategy Management
(define-constant ERR-STRATEGY-NOT-WHITELISTED (err u105))
(define-constant ERR-ALLOCATION-EXCEEDS-LIMIT (err u106))
(define-constant ERR-INSUFFICIENT-BALANCE (err u107))

;; Transaction Protection
(define-constant ERR-DEADLINE-PASSED (err u108))
(define-constant ERR-MINIMUM-DEPOSIT (err u109))
(define-constant ERR-SLIPPAGE-EXCEEDED (err u110))
```

---

## Strategy Manager API

### add-strategy

Whitelist strategy for vault usage (governance only).

```clarity
(define-public (add-strategy 
  (strategy principal) 
  (min-allocation uint) 
  (max-allocation uint)))
```

**Parameters:**
- `strategy` - Strategy contract principal
- `min-allocation` - Minimum allocation percentage (500 = 5%)
- `max-allocation` - Maximum allocation percentage (5000 = 50%)

---

### remove-strategy

Remove strategy from whitelist (governance only).

```clarity
(define-public (remove-strategy (strategy principal)))
```

---

### update-performance-fee

Change performance fee percentage (governance only).

```clarity
(define-public (update-performance-fee (new-fee uint)))
```

**Parameters:**
- `new-fee` - New fee in basis points (800 = 8%)

**Limits:** Maximum 2000 (20%)

---

## Gas Optimization Tips

**Batch Operations:**
```typescript
// Instead of multiple individual calls
for (let i = 0; i < 10; i++) {
  await contract.call("deposit", [Cl.uint(amount)]);
}

// Use single larger deposit
await contract.call("deposit", [Cl.uint(amount * 10)]);
```

**Read Operations:**
- Use read-only functions when possible
- Cache results that don't change frequently
- Use preview functions before transactions

**Transaction Timing:**
- Set reasonable deadlines (current + 10-50 blocks)
- Use appropriate gas prices for urgency
- Batch harvest operations across strategies

---

## Integration Examples

### React Hook

```typescript
import { useContract } from '@stacks/connect-react';

export function useVault(vaultAddress: string) {
  const { call, readOnly } = useContract(vaultAddress);
  
  const deposit = async (amount: number, minShares: number) => {
    return call('deposit', [
      Cl.uint(amount),
      Cl.uint(minShares)
    ]);
  };
  
  const getSharePrice = async () => {
    const result = await readOnly('get-share-price', []);
    return Number(Cl.uint(result));
  };
  
  return { deposit, getSharePrice };
}
```

### Python

```python
from stacks import StacksClient

client = StacksClient()

# Deposit
tx = client.call_contract(
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    'vault-stx-v2',
    'deposit',
    [uint(1500_000000), uint(0)]
)

# Check balance
balance = client.read_only(
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    'vault-stx-v2',
    'get-balance-of',
    [principal('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG')]
)
```

---

## Events

Contracts emit events via `print` statements:

```clarity
;; Deposit event
{ action: "deposit", user: tx-sender, amount: amount, shares: shares }

;; Withdraw event
{ action: "withdraw", user: tx-sender, shares: shares, amount: output }

;; Harvest event
{ action: "harvest", strategy: strategy, profit: profit, fee: fee }
```

Monitor events in frontend:
```typescript
const subscription = await client.watchContract(
  vaultAddress,
  (event) => {
    if (event.action === 'deposit') {
      console.log(`${event.user} deposited ${event.amount}`);
    }
  }
);
```

---

## Rate Limits & Quotas

**Blockchain Limits:**
- Max transaction size: 100KB
- Block time: ~10 minutes
- Transactions per block: Variable

**Recommended Limits:**
- Deposits: No hard limit (subject to gas)
- Withdrawals: Consider 24h cooldown in future
- Harvests: Once per strategy per day optimal

---

## Testing API Calls

```bash
# Install Clarinet
clarinet console

# Test deposit
(contract-call? .vault-stx-v2 deposit u1500000000 u0)

# Check balance
(contract-call? .vault-stx-v2 get-balance-of tx-sender)

# Check share price
(contract-call? .vault-stx-v2 get-share-price)
```

---

## Support

- **Documentation**: [GitHub Wiki](https://github.com/mattglory/snp-mvp/wiki)
- **Discord**: @geoglory  
- **Issues**: [GitHub Issues](https://github.com/mattglory/snp-mvp/issues)

---

**Last Updated**: December 2024  
**API Version**: 2.0  
**Contract Version**: vault-stx-v2
