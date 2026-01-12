# Your SNP Testnet Deployment

## Deployment Info

**Deployer Address**: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7`

**Network**: Stacks Testnet

**Explorer**: https://explorer.hiro.so/address/STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7?chain=testnet

---

## Your Deployed Contracts (17 Total)

### Core Vaults (3)
1. **vault-conservative** - Low risk vault (8-10% APY target)
   - Contract: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.vault-conservative`
   - Explorer: https://explorer.hiro.so/txid/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault-conservative?chain=testnet

2. **vault-stx-v2** - Balanced vault (12-16% APY target)
   - Contract: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.vault-stx-v2`

3. **vault-growth** - High yield vault (18-25% APY target)
   - Contract: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.vault-growth`

### Strategy Contracts (12)
4. **strategy-alex-stx-usda** - ALEX DEX LP strategy
5. **strategy-arkadiko-vault** - Arkadiko collateral strategy
6. **strategy-bitflow-v1** - Bitflow DEX strategy
7. **strategy-granite-v1** - Granite lending strategy
8. **strategy-hermetica-v1** - Hermetica synthetic assets
9. **strategy-sbtc-v1** - sBTC yield optimization
10. **strategy-stable-pool** - Stablecoin pool farming
11. **strategy-stackingdao-v1** - StackingDAO pooled stacking
12. **strategy-stackswap-v1** - StackSwap DEX farming
13. **strategy-stx-stacking** - Native STX stacking
14. **strategy-velar-farm** - Velar DEX farming
15. **strategy-zest-v1** - Zest Protocol lending

### Core Infrastructure (2)
16. **strategy-manager-v2** - Multi-strategy orchestration
17. **governance** - Protocol governance & voting

---

## Start Testing Now!

### Test 1: Deposit to Conservative Vault

1. Visit: https://explorer.hiro.so/txid/STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.vault-conservative?chain=testnet

2. Click "Call Function"

3. Select function: **deposit**

4. Enter parameters:
   - **amount**: `1000000` (1 STX in microSTX)
   - **min-shares**: `990000` (0.99 STX, allowing 1% slippage)
   - **deadline**: `999999999` (far future block)

5. Connect your wallet (make sure you're on testnet!)

6. Submit transaction

7. **Expected**: You receive vault shares (fungible tokens) representing your deposit

---

### Test 2: Check Your Balance

1. On same contract page

2. Select function: **get-balance-of** (read-only)

3. Enter your wallet address

4. Click "Call"

5. **Expected**: Returns your vault share balance (in microshares)

---

### Test 3: Check Vault Total Assets

1. Select function: **get-total-assets** (read-only)

2. Click "Call"

3. **Expected**: Returns total STX held in vault

---

### Test 4: Withdraw from Vault

1. Select function: **withdraw**

2. Enter parameters:
   - **shares**: `500000` (0.5 shares to burn)
   - **min-assets**: `490000` (minimum STX to receive)
   - **deadline**: `999999999`

3. Submit transaction

4. **Expected**: Burns your shares, returns proportional STX

---

## Admin Functions (Deployer Only)

You control these contracts with address: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7`

### Whitelist a Strategy

**Purpose**: Allow a strategy to receive vault allocations

1. Navigate to any vault (e.g., vault-conservative)

2. Select function: **whitelist-strategy**

3. Parameters:
   - **strategy**: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.strategy-stable-pool`
   - **whitelisted**: `true`

4. Submit with deployer wallet

---

### Allocate Funds to Strategy

**Purpose**: Deploy vault assets into a yield-generating strategy

**Prerequisites**:
- Strategy must be whitelisted
- Vault must have deposited funds

1. Select function: **allocate-to-strategy**

2. Parameters:
   - **strategy**: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.strategy-stable-pool`
   - **amount**: `1000000` (1 STX)

3. Submit with deployer wallet

---

### Harvest Strategy Rewards

**Purpose**: Collect earned yield and compound into vault

1. Select function: **harvest-strategy**

2. Parameters:
   - **strategy**: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.strategy-stable-pool`

3. Submit with deployer wallet

4. **Expected**:
   - Rewards collected from strategy
   - 8% performance fee deducted
   - Remaining 92% added to vault assets
   - Share price increases (compounding)

---

## Strategy Manager Testing

**Contract**: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.strategy-manager-v2`

### Register a Strategy

1. Navigate to strategy-manager-v2

2. Select function: **register-strategy**

3. Parameters:
   - **strategy**: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.strategy-alex-stx-usda`
   - **name**: `"ALEX STX-USDA LP"`
   - **apy**: `1500` (15.00% APY)
   - **risk-score**: `300` (30% risk level)
   - **tvl-cap**: `100000000000` (100K STX cap)

4. Submit with deployer wallet

---

### Update Health Score

1. Select function: **update-health-score**

2. Parameters:
   - **strategy**: `STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7.strategy-stable-pool`
   - **new-score**: `9500` (95% health)

3. Submit

4. **Note**: If score drops below 5000 (50%), strategy auto-pauses

---

## Emergency Functions

### Pause All Operations

1. Navigate to any vault

2. Select function: **toggle-emergency-shutdown**

3. Submit with deployer wallet

4. **Effect**: All deposits/withdrawals blocked until re-enabled

### Resume Operations

1. Call **toggle-emergency-shutdown** again to unpause

---

## Read-Only Queries (No Gas Cost)

Test these without spending STX:

### Vault Queries
- `get-total-assets()` - Total STX in vault
- `get-total-supply()` - Total shares issued
- `get-balance-of(address)` - User's share balance
- `get-contract-owner()` - Current admin
- `is-emergency-shutdown()` - Check if paused
- `is-strategy-whitelisted(strategy)` - Check strategy status
- `get-strategy-allocation(strategy)` - Check strategy TVL

### Strategy Manager Queries
- `get-strategy-details(strategy)` - Get full strategy info
- `get-total-strategies()` - Count registered strategies
- `is-strategy-active(strategy)` - Check if operational

---

## Testing Checklist

### Basic Operations
- [ ] Deposit STX to vault
- [ ] Check share balance
- [ ] Check total assets
- [ ] Withdraw STX from vault
- [ ] Transfer shares to another address

### Admin Operations
- [ ] Whitelist a strategy
- [ ] Allocate vault funds to strategy
- [ ] Harvest strategy rewards
- [ ] Update strategy health score
- [ ] Emergency pause/unpause

### Strategy Manager
- [ ] Register new strategy
- [ ] Update strategy details
- [ ] Check strategy status
- [ ] Pause strategy

### Edge Cases
- [ ] Try to allocate to non-whitelisted strategy (should fail)
- [ ] Try admin function from non-owner wallet (should fail)
- [ ] Set deadline in past (should fail with ERR-DEADLINE-PASSED)
- [ ] Withdraw more than you have (should fail)

---

## Common Errors

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `ERR-UNAUTHORIZED (u100)` | Not contract owner | Use deployer wallet |
| `ERR-STRATEGY-NOT-WHITELISTED (u102)` | Strategy not approved | Call whitelist-strategy first |
| `ERR-INSUFFICIENT-BALANCE (u104)` | Not enough funds | Deposit more or reduce amount |
| `ERR-SLIPPAGE-TOO-HIGH (u105)` | min-shares/assets not met | Increase slippage tolerance |
| `ERR-EMERGENCY-SHUTDOWN (u106)` | Vault paused | Call toggle-emergency-shutdown |
| `ERR-DEADLINE-PASSED (u107)` | Transaction expired | Use future block height |

---

## Contract Source Code

All contracts are open source and verified on testnet.

View source by searching contract on Explorer, then clicking "Source Code" tab.

---

## Monitor Your Deployment

### Real-Time Monitoring

**Transactions**: https://explorer.hiro.so/address/STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7/transactions?chain=testnet

**Token Transfers**: https://explorer.hiro.so/address/STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7/token-transfers?chain=testnet

### API Queries

```bash
# Get account info
curl https://api.testnet.hiro.so/v2/accounts/STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7?proof=0

# Get contract source
curl https://api.testnet.hiro.so/v2/contracts/source/STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7/vault-conservative

# Call read-only function
curl -X POST https://api.testnet.hiro.so/v2/contracts/call-read/STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7/vault-conservative/get-total-assets \
  -H "Content-Type: application/json" \
  -d '{"sender":"STQKNVNB5XBSADFSVWAHYH4BXKAMYE9FS1GFEMS7","arguments":[]}'
```

---

## Next Steps

1. ✅ **Test basic deposit/withdraw flow**
2. ✅ **Test admin functions (whitelist, allocate)**
3. ✅ **Test emergency mechanisms**
4. ✅ **Monitor gas costs and performance**
5. ✅ **Document any issues found**
6. 📝 **Build frontend interface**
7. 🔒 **Plan security audit**
8. 🚀 **Prepare mainnet deployment**

---

## Support Resources

- **Full Testing Guide**: See `TESTNET-DEPLOYMENT-GUIDE.md`
- **Quick Deploy**: See `QUICK-DEPLOY.md`
- **GitHub**: https://github.com/mattglory/snp-mvp
- **Discord**: geoglory
- **Twitter**: @mattglory14

---

**Your contracts are LIVE and ready to test!** 🎉

Start with Test 1 above and work through the checklist.
