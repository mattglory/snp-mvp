# SNP Testnet Deployment & Testing Guide

## Current Status

**Deployment Attempt Result**: A previous deployment exists at `ST2X1GBHA2WJXREWP231EEQXZ1GDYZEEXYRAD1PA8` (FlashStack project).

**Required Action**: Deploy SNP contracts using a new testnet address to avoid conflicts.

---

## Step 1: Get a Fresh Testnet Deployer Account

### Option A: Use Hiro Wallet (Recommended)

1. Install Hiro Wallet browser extension: https://wallet.hiro.so/
2. Create a new wallet or import an existing one
3. Switch to Testnet network in wallet settings
4. Copy your testnet address (starts with ST...)
5. Export your Secret Key (Settings → View Secret Key)

### Option B: Generate with Stacks CLI

```bash
# Install @stacks/cli
npm install -g @stacks/cli

# Generate new account
stx make_keychain -t

# Output will show:
# - mnemonic (24 words)
# - privateKey
# - btcAddress
# - stxAddress (use this for testnet)
```

### Option C: Use Online Generator

Visit: https://stackstools.github.io/
- Generate new wallet
- Save mnemonic securely
- Use testnet address for deployment

---

## Step 2: Fund Your Deployer Account

**Deployer Address**: [Your generated address from Step 1]

**Required Amount**: ~2-3 STX (deployment costs ~1.18 STX + buffer)

### Get Testnet STX

**Option 1: Hiro Faucet** (Recommended)
```
Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
Enter your address
Click "Request STX"
Wait 1-2 minutes for confirmation
```

**Option 2: Discord Faucet**
```
Join Stacks Discord: https://discord.gg/stacks
Go to #testnet-faucet channel
Type: !faucet <your-testnet-address>
```

**Verify Balance**:
```bash
curl https://api.testnet.hiro.so/v2/accounts/[YOUR-ADDRESS]?proof=0
```

---

## Step 3: Update Testnet Configuration

Update `settings/Testnet.toml` with your new deployer:

```toml
[network]
name = "testnet"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "your twenty four word mnemonic phrase here from step one"
balance = 100_000_000_000_000
```

**⚠️ SECURITY WARNING**: Never commit real mnemonics to GitHub! Add `settings/Testnet.toml` to `.gitignore` before committing.

---

## Step 4: Generate Deployment Plan

```bash
# Generate fresh deployment plan
clarinet deployment generate --testnet --medium-cost

# When prompted "Overwrite? [Y/n]", type: Y
```

**Expected Output**:
```
Generated file deployments\default.testnet-plan.yaml
Total cost: ~1.183880 STX
Duration: 1 blocks
```

---

## Step 5: Deploy to Testnet

```bash
# Deploy all contracts
clarinet deployments apply --testnet

# When prompted "Continue [Y/n]?", type: Y
```

**Deployment Progress**:
The deployment will show 17 contract publications:
- ✅ governance
- ✅ strategy-alex-stx-usda
- ✅ strategy-arkadiko-vault
- ✅ strategy-bitflow-v1
- ✅ strategy-granite-v1
- ✅ strategy-hermetica-v1
- ✅ strategy-manager-v2
- ✅ strategy-sbtc-v1
- ✅ strategy-stable-pool
- ✅ strategy-stackingdao-v1
- ✅ strategy-stackswap-v1
- ✅ strategy-stx-stacking
- ✅ strategy-velar-farm
- ✅ strategy-zest-v1
- ✅ vault-conservative
- ✅ vault-growth
- ✅ vault-stx-v2

**Deployment Time**: ~2-5 minutes (one block confirmation)

---

## Step 6: Verify Deployment

### Check on Stacks Explorer

Visit: https://explorer.hiro.so/?chain=testnet

Search for your deployer address to see all deployed contracts.

### Verify Individual Contracts

```bash
# Check governance contract
curl "https://api.testnet.hiro.so/v2/contracts/interface/[YOUR-ADDRESS]/governance"

# Check vault-stx-v2 contract
curl "https://api.testnet.hiro.so/v2/contracts/interface/[YOUR-ADDRESS]/vault-stx-v2"

# Check strategy-manager-v2 contract
curl "https://api.testnet.hiro.so/v2/contracts/interface/[YOUR-ADDRESS]/strategy-manager-v2"
```

---

## Manual Testing Guide

### Prerequisites for Testing

1. **Test Wallet with STX**:
   - Use a separate wallet from the deployer (for safety)
   - Fund with 1000-5000 STX from faucet
   - Keep track of the address for testing

2. **Stacks CLI or Frontend**:
   - Use Stacks CLI for command-line testing
   - Or build a simple frontend with @stacks/connect
   - Or use Hiro Explorer's contract call interface

---

### Test Case 1: Deposit to Conservative Vault

**Goal**: Deposit STX into the low-risk conservative vault and receive vault shares.

**Contract**: `vault-conservative`
**Function**: `deposit`

#### Using Hiro Explorer

1. Go to: https://explorer.hiro.so/?chain=testnet
2. Search for: `[YOUR-DEPLOYER].vault-conservative`
3. Click "Call Function"
4. Select function: `deposit`
5. Parameters:
   - `amount`: `1000000` (1 STX in microSTX)
   - `min-shares`: `990000` (0.99 STX - 1% slippage tolerance)
   - `deadline`: `999999999` (far future block)
6. Click "Submit Transaction"
7. Approve in wallet

**Expected Result**:
- Transaction succeeds
- You receive vault shares (approximately 1:1 ratio on first deposit)
- Your STX balance decreases by 1 STX
- Vault's total-assets increases

**Verify**:
```bash
# Check your vault share balance
curl "https://api.testnet.hiro.so/v2/contracts/call-read/[DEPLOYER]/vault-conservative/get-balance-of" \
  -H "Content-Type: application/json" \
  -d '{"sender":"[YOUR-TEST-ADDRESS]","arguments":["0x[YOUR-TEST-ADDRESS-HEX]"]}'
```

---

### Test Case 2: Check Vault Read-Only Functions

**Goal**: Query vault state without making transactions.

#### Check Total Assets

**Contract**: `vault-conservative`
**Function**: `get-total-assets`

```bash
curl "https://api.testnet.hiro.so/v2/contracts/call-read/[DEPLOYER]/vault-conservative/get-total-assets" \
  -H "Content-Type: application/json" \
  -d '{"sender":"[YOUR-ADDRESS]","arguments":[]}'
```

**Expected**: Returns total STX held in vault

#### Check Total Supply of Shares

**Contract**: `vault-conservative`
**Function**: `get-total-supply`

```bash
curl "https://api.testnet.hiro.so/v2/contracts/call-read/[DEPLOYER]/vault-conservative/get-total-supply" \
  -H "Content-Type: application/json" \
  -d '{"sender":"[YOUR-ADDRESS]","arguments":[]}'
```

**Expected**: Returns total vault shares issued

#### Check Your Share Balance

**Contract**: `vault-conservative`
**Function**: `get-balance-of`

Use address from Test Case 1.

---

### Test Case 3: Whitelist a Strategy (Admin Only)

**Goal**: Enable a strategy to receive vault allocations.

**Contract**: `vault-conservative` (or `vault-stx-v2`, `vault-growth`)
**Function**: `whitelist-strategy`

**⚠️ Must be called by contract owner (deployer)**

#### Using Hiro Explorer

1. Login with deployer wallet
2. Navigate to vault contract
3. Call function: `whitelist-strategy`
4. Parameters:
   - `strategy`: `[DEPLOYER].strategy-stable-pool` (example)
   - `whitelisted`: `true`
5. Submit transaction

**Expected Result**:
- Transaction succeeds (if called by owner)
- Strategy is now approved to receive funds
- ERR-UNAUTHORIZED (err u100) if not owner

**Verify**:
```bash
# Check if strategy is whitelisted
curl "https://api.testnet.hiro.so/v2/contracts/call-read/[DEPLOYER]/vault-conservative/is-strategy-whitelisted" \
  -H "Content-Type: application/json" \
  -d '{"sender":"[YOUR-ADDRESS]","arguments":["0x[STRATEGY-CONTRACT-ADDRESS-HEX]"]}'
```

---

### Test Case 4: Allocate Funds to Strategy

**Goal**: Move vault assets into an active strategy to earn yield.

**Contract**: `vault-conservative`
**Function**: `allocate-to-strategy`

**Prerequisites**:
- Strategy must be whitelisted (Test Case 3)
- Vault must have deposited funds (Test Case 1)
- Only owner can allocate

#### Steps

1. Login with deployer wallet
2. Navigate to `vault-conservative`
3. Call function: `allocate-to-strategy`
4. Parameters:
   - `strategy`: `[DEPLOYER].strategy-stable-pool`
   - `amount`: `500000` (0.5 STX)
5. Submit transaction

**Expected Result**:
- STX transferred from vault to strategy
- `strategy-assets` map updated with allocation
- Strategy's `deposit` function called successfully

**Errors to Watch**:
- `ERR-UNAUTHORIZED (u100)`: Not the owner
- `ERR-STRATEGY-NOT-WHITELISTED (u102)`: Strategy not approved
- `ERR-INSUFFICIENT-BALANCE (u104)`: Vault doesn't have enough STX

**Verify**:
```bash
# Check strategy allocation
curl "https://api.testnet.hiro.so/v2/contracts/call-read/[DEPLOYER]/vault-conservative/get-strategy-allocation" \
  -H "Content-Type: application/json" \
  -d '{"sender":"[YOUR-ADDRESS]","arguments":["0x[STRATEGY-ADDRESS-HEX]"]}'
```

---

### Test Case 5: Harvest Rewards from Strategy

**Goal**: Collect earned yield from strategies and compound into vault.

**Contract**: `vault-conservative`
**Function**: `harvest-strategy`

**Prerequisites**:
- Strategy must have allocated funds
- Time must pass for yields to accumulate (or mock yields for testing)

#### Steps

1. Login with deployer wallet
2. Navigate to `vault-conservative`
3. Call function: `harvest-strategy`
4. Parameters:
   - `strategy`: `[DEPLOYER].strategy-stable-pool`
5. Submit transaction

**Expected Result**:
- Strategy's `harvest` function returns reward amount
- Vault's `total-assets` increases by rewards
- Performance fee deducted (8% of rewards)
- No shares are issued (compounding effect)

**Example**:
- Strategy earned 10 STX
- Performance fee: 0.8 STX (8%)
- Vault receives: 9.2 STX
- Total assets: previous + 9.2 STX

---

### Test Case 6: Withdraw from Vault

**Goal**: Redeem vault shares for underlying STX.

**Contract**: `vault-conservative`
**Function**: `withdraw`

**Prerequisites**:
- You must have vault shares (from Test Case 1)
- Calculate shares to burn vs. assets to receive

#### Steps

1. Login with your test wallet (not deployer)
2. Check your share balance (Test Case 2)
3. Navigate to `vault-conservative`
4. Call function: `withdraw`
5. Parameters:
   - `shares`: `500000` (0.5 shares)
   - `min-assets`: `490000` (0.49 STX - 2% slippage)
   - `deadline`: `999999999`
6. Submit transaction

**Expected Result**:
- Your shares are burned
- You receive STX proportional to shares redeemed
- STX = (shares × total-assets) / total-supply
- Transaction fails if min-assets not met

**Share Price Calculation**:
```
share_price = total_assets / total_supply
assets_received = shares_to_burn × share_price
```

**Example**:
- Total assets: 10 STX
- Total supply: 10 shares
- Share price: 1.0 STX/share
- You burn 5 shares → receive 5 STX

---

### Test Case 7: Emergency Pause Mechanism

**Goal**: Test emergency circuit breaker to halt all operations.

**Contract**: `vault-conservative`
**Function**: `toggle-emergency-shutdown`

**Admin Function - Deployer Only**

#### Activate Emergency Pause

1. Login with deployer wallet
2. Navigate to `vault-conservative`
3. Call function: `toggle-emergency-shutdown`
4. Submit transaction

**Expected Result**:
- `emergency-shutdown` var set to `true`
- All deposit/withdraw/allocate functions blocked
- Only emergency withdrawals allowed

#### Test Blocked Operations

Try to deposit (should fail):
- Call `deposit` function
- Expected error: `ERR-EMERGENCY-SHUTDOWN (u106)`

#### Resume Operations

1. Call `toggle-emergency-shutdown` again
2. `emergency-shutdown` set back to `false`
3. Normal operations resume

---

### Test Case 8: Strategy Manager Integration

**Goal**: Test centralized strategy management across all vaults.

**Contract**: `strategy-manager-v2`
**Function**: `register-strategy`

#### Register a New Strategy

1. Login with deployer wallet
2. Navigate to `strategy-manager-v2`
3. Call function: `register-strategy`
4. Parameters:
   - `strategy`: `[DEPLOYER].strategy-alex-stx-usda`
   - `name`: `"ALEX STX-USDA LP"`
   - `apy`: `1500` (15.00% APY)
   - `risk-score`: `300` (30% risk)
   - `tvl-cap`: `1000000000000` (1M STX cap)
5. Submit transaction

**Expected Result**:
- Strategy registered in manager
- Initial health-score: 10000 (100%)
- Active: true
- Emergency: false

**Verify**:
```bash
curl "https://api.testnet.hiro.so/v2/contracts/call-read/[DEPLOYER]/strategy-manager-v2/get-strategy-details" \
  -H "Content-Type: application/json" \
  -d '{"sender":"[YOUR-ADDRESS]","arguments":["0x[STRATEGY-ADDRESS-HEX]"]}'
```

---

### Test Case 9: Multi-Vault Deposit Testing

**Goal**: Deposit into all three vaults and compare share prices.

#### Conservative Vault
- Expected APY: 8-10%
- Risk: 2/5 (Low)
- Contract: `vault-conservative`

#### Balanced Vault
- Expected APY: 12-16%
- Risk: 3/5 (Medium)
- Contract: `vault-stx-v2`

#### Growth Vault
- Expected APY: 18-25%
- Risk: 4/5 (High)
- Contract: `vault-growth`

**Test Steps**:
1. Deposit 10 STX into each vault
2. Record share amounts received
3. Check if 1:1 ratio maintained
4. Verify total-assets matches deposits

---

### Test Case 10: Strategy Health Score Update

**Goal**: Simulate strategy performance monitoring.

**Contract**: `strategy-manager-v2`
**Function**: `update-health-score`

**Admin Function**

#### Update Health Score

1. Login with deployer wallet
2. Navigate to `strategy-manager-v2`
3. Call function: `update-health-score`
4. Parameters:
   - `strategy`: `[DEPLOYER].strategy-stable-pool`
   - `new-score`: `9500` (95% - slight degradation)
5. Submit transaction

**Expected Result**:
- Health score updated to 9500
- If score < 5000 (50%): automatic emergency pause
- Strategy remains active (score above threshold)

#### Test Emergency Threshold

1. Update score to `4500` (45%)
2. Expected: Strategy automatically paused
3. `emergency` = true, `active` = false

---

## Advanced Testing Scenarios

### Stress Test: Multiple Concurrent Users

1. Create 5 test wallets
2. Fund each with 100 STX
3. Have all deposit simultaneously
4. Check for race conditions
5. Verify accounting accuracy

### Slippage Protection Test

1. Deposit large amount (e.g., 100 STX)
2. Set tight min-shares (e.g., 99.9 STX)
3. Try to front-run transaction
4. Verify protection works

### Deadline Expiry Test

1. Set deadline to current block + 1
2. Wait 2 blocks
3. Try to execute transaction
4. Expected: ERR-DEADLINE-PASSED

---

## Testing Checklist

### Core Vault Functions
- [ ] Deposit STX
- [ ] Withdraw STX
- [ ] Transfer shares
- [ ] Check balances
- [ ] Emergency shutdown

### Strategy Management
- [ ] Whitelist strategy
- [ ] Allocate to strategy
- [ ] Harvest rewards
- [ ] Emergency withdraw from strategy
- [ ] Update health scores

### Governance
- [ ] Create proposal
- [ ] Vote on proposal
- [ ] Execute proposal
- [ ] Cancel proposal

### Edge Cases
- [ ] Minimum deposit (1000 STX first deposit protection)
- [ ] Zero amount operations
- [ ] Unauthorized access attempts
- [ ] Invalid strategy calls
- [ ] Deadline handling

---

## Common Errors and Solutions

### ERR-UNAUTHORIZED (u100)
- **Cause**: Function called by non-owner
- **Solution**: Use deployer wallet for admin functions

### ERR-EMERGENCY-SHUTDOWN (u106)
- **Cause**: Vault in emergency mode
- **Solution**: Call `toggle-emergency-shutdown` to resume

### ERR-INSUFFICIENT-BALANCE (u104)
- **Cause**: Not enough STX in vault or user account
- **Solution**: Deposit more STX or reduce amount

### ERR-STRATEGY-NOT-WHITELISTED (u102)
- **Cause**: Strategy not approved
- **Solution**: Call `whitelist-strategy` first

### ERR-SLIPPAGE-TOO-HIGH (u105)
- **Cause**: min-shares/min-assets not met
- **Solution**: Adjust slippage tolerance or split transaction

### ERR-DEADLINE-PASSED (u107)
- **Cause**: Transaction expired
- **Solution**: Use higher block height for deadline

---

## Monitoring and Analytics

### Track Vault Performance

```bash
# Get vault APY over time
# Check total-assets at T0
curl "https://api.testnet.hiro.so/v2/contracts/call-read/[DEPLOYER]/vault-conservative/get-total-assets" > t0.json

# Wait 24 hours or simulate with harvest

# Check total-assets at T1
curl "https://api.testnet.hiro.so/v2/contracts/call-read/[DEPLOYER]/vault-conservative/get-total-assets" > t1.json

# Calculate APY:
# APY = ((assets_t1 - assets_t0) / assets_t0) * (365 / days_elapsed) * 100
```

### Monitor Transaction History

Visit: https://explorer.hiro.so/address/[DEPLOYER]?chain=testnet

Filter by:
- Contract calls
- Token transfers
- STX transfers

---

## Testnet Resources

### Block Explorers
- Hiro Explorer: https://explorer.hiro.so/?chain=testnet
- Stacks Explorer: https://testnet.explorer.stacks.co/

### APIs
- Hiro API: https://api.testnet.hiro.so
- API Docs: https://docs.hiro.so/api

### Faucets
- Hiro Faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- Discord Faucet: https://discord.gg/stacks (#testnet-faucet)

### Developer Tools
- Clarinet Docs: https://docs.hiro.so/clarinet
- Stacks.js: https://github.com/hirosystems/stacks.js
- Hiro Platform: https://platform.hiro.so/

---

## Next Steps After Testing

1. **Document Issues**: Track bugs and edge cases found
2. **Gas Optimization**: Identify expensive operations
3. **Security Audit**: Prepare for professional audit
4. **Frontend Development**: Build user-friendly interface
5. **Mainnet Planning**: Set TVL caps and gradual rollout

---

## Support

- GitHub Issues: https://github.com/mattglory/snp-mvp/issues
- Discord: geoglory
- Twitter: @mattglory14

---

**Last Updated**: 2025-12-16
**Version**: 1.0.0
**Network**: Stacks Testnet
