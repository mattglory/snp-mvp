# Quick Testnet Deployment Steps

## TL;DR - Deploy in 5 Minutes

### 1. Generate New Wallet

Visit: https://stackstools.github.io/
- Click "Generate Wallet"
- Save mnemonic securely
- Copy testnet address (starts with ST...)

### 2. Get Testnet STX

Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- Paste your address
- Click "Request STX"
- Wait 30-60 seconds

### 3. Update Config

Edit `settings/Testnet.toml`:
```toml
[accounts.deployer]
mnemonic = "your 24 word phrase from step 1"
balance = 100_000_000_000_000
```

⚠️ **IMPORTANT**: Add `settings/Testnet.toml` to `.gitignore` before committing!

### 4. Generate Deployment Plan

```bash
clarinet deployment generate --testnet --medium-cost
# Type Y when prompted
```

### 5. Deploy

```bash
echo Y | clarinet deployments apply --testnet
```

Wait 2-5 minutes for all 17 contracts to deploy.

### 6. Verify

Visit: https://explorer.hiro.so/?chain=testnet

Search for your address to see deployed contracts.

---

## What Gets Deployed?

**3 Vaults** (Risk-adjusted pools):
- `vault-conservative` - Low risk, stable yields (8-10% APY)
- `vault-stx-v2` - Balanced risk/reward (12-16% APY)
- `vault-growth` - High yield strategies (18-25% APY)

**12 Strategies** (DeFi protocol integrations):
- strategy-alex-stx-usda
- strategy-arkadiko-vault
- strategy-bitflow-v1
- strategy-granite-v1
- strategy-hermetica-v1
- strategy-sbtc-v1
- strategy-stable-pool
- strategy-stackingdao-v1
- strategy-stackswap-v1
- strategy-stx-stacking
- strategy-velar-farm
- strategy-zest-v1

**2 Core Contracts**:
- `strategy-manager-v2` - Orchestrates all strategies
- `governance` - Protocol governance

**Total Deployment Cost**: ~1.18 STX

---

## Quick Test After Deployment

### Test 1: Deposit STX

Using Hiro Explorer:
1. Go to https://explorer.hiro.so/?chain=testnet
2. Search: `[YOUR-ADDRESS].vault-conservative`
3. Click "Call Function"
4. Select: `deposit`
5. Parameters:
   - amount: `1000000` (1 STX)
   - min-shares: `990000` (0.99 STX)
   - deadline: `999999999`
6. Submit transaction

**Result**: You receive vault shares in return for your STX.

### Test 2: Check Balance

1. Navigate to same contract
2. Select function: `get-balance-of`
3. Enter your address
4. Click "Call Read-Only Function"

**Result**: Shows your vault share balance.

### Test 3: Withdraw STX

1. Select function: `withdraw`
2. Parameters:
   - shares: `500000` (0.5 shares)
   - min-assets: `490000` (0.49 STX)
   - deadline: `999999999`
3. Submit transaction

**Result**: Burns shares, returns STX to your wallet.

---

## Common Issues

### "ContractAlreadyExists" Error
- **Fix**: You're using an address that already deployed contracts
- **Solution**: Generate a new wallet (Step 1) and use a fresh address

### "Insufficient balance" Error
- **Fix**: Deployer doesn't have enough testnet STX
- **Solution**: Visit faucet again and request more STX

### "Invalid mnemonic" Error
- **Fix**: Mnemonic has invalid checksum
- **Solution**: Generate a new mnemonic using a proper tool

### Deployment Hangs
- **Fix**: Network congestion or testnet issues
- **Solution**: Wait 5 minutes, check testnet status at https://status.test.hiro.so/

---

## Full Testing Guide

See `TESTNET-DEPLOYMENT-GUIDE.md` for:
- 10 comprehensive test cases
- Admin functions guide
- Strategy management
- Emergency scenarios
- Performance monitoring
- API testing examples

---

## Important Notes

1. **Never commit real mnemonics** to GitHub
2. **Testnet tokens have no value** - test freely
3. **Deployment is permanent** - can't delete contracts
4. **Gas costs are low** on testnet (~1 STX for full deployment)
5. **Contracts are public** - anyone can call read-only functions

---

## Your Deployed Contracts

After deployment, your contracts will be at:

```
[YOUR-ADDRESS].governance
[YOUR-ADDRESS].vault-conservative
[YOUR-ADDRESS].vault-stx-v2
[YOUR-ADDRESS].vault-growth
[YOUR-ADDRESS].strategy-manager-v2
[YOUR-ADDRESS].strategy-alex-stx-usda
[YOUR-ADDRESS].strategy-arkadiko-vault
[YOUR-ADDRESS].strategy-bitflow-v1
[YOUR-ADDRESS].strategy-granite-v1
[YOUR-ADDRESS].strategy-hermetica-v1
[YOUR-ADDRESS].strategy-sbtc-v1
[YOUR-ADDRESS].strategy-stable-pool
[YOUR-ADDRESS].strategy-stackingdao-v1
[YOUR-ADDRESS].strategy-stackswap-v1
[YOUR-ADDRESS].strategy-stx-stacking
[YOUR-ADDRESS].strategy-velar-farm
[YOUR-ADDRESS].strategy-zest-v1
```

Replace `[YOUR-ADDRESS]` with your deployer address from Step 1.

---

## Next Steps

1. **Test Basic Operations**: Deposit → Withdraw
2. **Test Admin Functions**: Whitelist strategies, allocate funds
3. **Test Emergency Features**: Pause mechanism
4. **Monitor Gas Usage**: Track transaction costs
5. **Document Issues**: Keep notes on bugs found
6. **Build Frontend**: Create user interface for vaults

---

**Need Help?**
- Full Guide: `TESTNET-DEPLOYMENT-GUIDE.md`
- GitHub Issues: https://github.com/mattglory/snp-mvp/issues
- Discord: geoglory
