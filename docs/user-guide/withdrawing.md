# Withdrawing Funds from SNP Vaults

Learn how to withdraw your assets from SNP vaults safely and efficiently.

---

## 🔄 Quick Withdrawal Guide

### Key Facts

✅ **No Lock-Up Periods** - Withdraw anytime, 24/7
✅ **No Withdrawal Fees** - 0% withdrawal fee (unlike many competitors)
✅ **Instant or Fast** - Most withdrawals complete in seconds
✅ **Flexible Amounts** - Withdraw any amount, from 1 STX to your full balance
✅ **Keep Earning** - Your remaining balance continues earning

---

## 📝 Step-by-Step Withdrawal Process

### Step 1: Connect Your Wallet

1. Navigate to [SNP App](https://app.snp-protocol.com)
2. Connect your wallet (same wallet used for deposit)
3. View your positions dashboard

```
✓ Wallet Connected
Your Positions:
├─ Balanced Vault: 1,428 snSTX-BAL (1,502 STX)
└─ Growth Vault: 476 snSTX-GRW (498 STX)
```

### Step 2: Select Vault to Withdraw From

Click on the vault you want to withdraw from:

```
┌─────────────────────────────────────┐
│ Balanced Vault Position             │
├─────────────────────────────────────┤
│ Your Tokens: 1,428 snSTX-BAL        │
│ Current Value: 1,502 STX ($1,277)   │
│ Deposited: 1,500 STX                │
│ Earned: +2 STX (+0.13%)             │
│                                      │
│ Current Share Price:                │
│ 1 snSTX-BAL = 1.052 STX             │
│                                      │
│ [Deposit] [Withdraw]                │
└─────────────────────────────────────┘
```

### Step 3: Enter Withdrawal Amount

Two ways to specify amount:

**Option A: By Token Amount**
```
Enter snSTX-BAL tokens to burn:
[500] snSTX-BAL

You'll receive: 526 STX
```

**Option B: By STX Amount**
```
Enter STX to withdraw:
[500] STX

Required tokens: 475 snSTX-BAL
```

**Quick Buttons:**
```
[25%] [50%] [75%] [MAX]
```

### Step 4: Review Withdrawal Details

```
┌─────────────────────────────────────┐
│ Withdrawal Summary                  │
├─────────────────────────────────────┤
│ Vault: Balanced Vault               │
│                                      │
│ Burn Tokens: 500 snSTX-BAL          │
│ Receive: 526 STX                    │
│ Exchange Rate: 1.052 STX per token  │
│                                      │
│ Remaining Position:                 │
│ 928 snSTX-BAL (976 STX)             │
│                                      │
│ Withdrawal Method: Instant          │
│ Source: Vault Reserve (5%)          │
│                                      │
│ Fees:                                │
│ └─ Withdrawal Fee: 0 STX (0%)       │
│                                      │
│ Transaction Fee: ~0.001 STX         │
│                                      │
│ Total You Receive: 526 STX          │
└─────────────────────────────────────┘
```

### Step 5: Confirm Transaction

1. Click **"Withdraw"**
2. Review transaction in wallet popup
3. Confirm the transaction
4. Wait for confirmation (typically 10-20 seconds)

```
⏳ Processing Withdrawal...
📦 Block: #125,492
🔗 TxID: 0x9b2f...5e3d

✅ Withdrawal Complete!
```

### Step 6: Verify Receipt

Check your wallet:

```
✓ 526 STX received
✓ Transaction confirmed
✓ Remaining vault position: 928 snSTX-BAL

Your wallet balance:
├─ Before: 100 STX
└─ After: 626 STX (+526 STX)
```

---

## ⚡ Withdrawal Speed

### Instant Withdrawals (Most Common)

When vault has sufficient reserves:

```
Reserve Status: 5% (50,000 STX available)

Withdrawals up to 50,000 STX:
└─ Instant (one transaction)
   └─ Confirmation time: ~15 seconds
```

### Standard Withdrawals (Occasionally)

When withdrawing more than reserve:

```
Vault Reserve: 50,000 STX
Your Withdrawal: 75,000 STX

Process:
1. Withdraw 50,000 STX from reserve (instant)
2. Free 25,000 STX from strategies (1-2 blocks)
3. Complete withdrawal (total: 30-60 seconds)
```

### Large Withdrawals

For very large amounts (>5% of vault TVL):

```
Vault TVL: 1,000,000 STX
Your Withdrawal: 100,000 STX (10%)

Process:
1. Withdraw from reserve: 50,000 STX
2. Free from Strategy A: 25,000 STX (1 block)
3. Free from Strategy B: 25,000 STX (1 block)
Total time: 60-90 seconds
```

**Note:** Withdrawals >20% of vault TVL may be split across multiple transactions for optimal gas efficiency.

---

## 💰 Understanding Withdrawal Value

### Share Price Appreciation

Your vault tokens increase in value over time:

```
Initial Deposit:
- Deposited: 1,000 STX
- Received: 952 snSTX-BAL
- Share Price: 1.05 STX

After 30 Days:
- Your Tokens: 952 snSTX-BAL (unchanged)
- Share Price: 1.062 STX (increased!)
- Withdrawal Value: 952 × 1.062 = 1,011 STX
- Profit: 11 STX (+1.1%)
```

### Realized vs Unrealized Gains

```
Scenario: You have 1,000 snSTX worth 1,050 STX

Withdraw 50% (500 snSTX):
├─ Realized Gain: +25 STX (taxable event)
├─ Receive: 525 STX
└─ Remaining: 500 snSTX (525 STX unrealized)

Withdraw 100% (1,000 snSTX):
├─ Realized Gain: +50 STX (taxable event)
├─ Receive: 1,050 STX
└─ Remaining: 0 snSTX
```

**Tax Note:** Consult a tax professional. In many jurisdictions, withdrawing creates a taxable event.

---

## 🎯 Withdrawal Strategies

### Partial Withdrawal Strategy

Take profits while staying invested:

```
Strategy: Harvest Gains, Keep Principal

Initial: 10,000 STX deposited
After 1 year: Position worth 11,270 STX

Option 1: Withdraw gains only
├─ Withdraw: 1,270 STX (gains)
├─ Keep: 10,000 STX (principal)
└─ Continues earning on 10,000 STX

Option 2: Withdraw principal, keep gains
├─ Withdraw: 10,000 STX (principal)
├─ Keep: 1,270 STX (gains)
└─ Let profits ride, risk-free
```

### Rebalancing Between Vaults

Move capital to better opportunities:

```
Current Allocation:
├─ Conservative: 5,000 STX (8% APY)
└─ Balanced: 3,000 STX (12% APY)

Rebalance Strategy:
1. Withdraw 2,000 STX from Conservative
2. Deposit 2,000 STX into Balanced

New Allocation:
├─ Conservative: 3,000 STX (8% APY)
└─ Balanced: 5,000 STX (12% APY)

Result: Higher blended APY
```

### Dollar-Cost Averaging Out

Exit gradually to reduce timing risk:

```
Total Position: 20,000 STX

Week 1: Withdraw 5,000 STX (25%)
Week 2: Withdraw 5,000 STX (25%)
Week 3: Withdraw 5,000 STX (25%)
Week 4: Withdraw 5,000 STX (25%)

Benefits:
✓ Averages out exit price
✓ Reduces timing risk
✓ Keeps earning on remaining balance
```

### Emergency Withdrawal

Need funds fast?

```
Scenario: Unexpected expense

Step 1: Calculate need (e.g., 3,000 STX)
Step 2: Withdraw exact amount needed
Step 3: Leave rest earning yield

Benefit: Only withdraw what you need
Your remaining capital keeps working
```

---

## ⚠️ Important Considerations

### 1. **No Withdrawal Fees**

SNP charges **zero withdrawal fees**:

```
Withdraw 10,000 STX:
├─ Withdrawal Fee: 0 STX (0%)
├─ Transaction Fee: ~0.001 STX (gas)
└─ You Receive: 10,000 STX

Compare to others:
├─ Some protocols: 0.5% withdrawal fee
└─ SNP: 0% withdrawal fee
```

### 2. **Share Token Burn**

When you withdraw, vault tokens are burned:

```
Before Withdrawal:
├─ Total snSTX-BAL Supply: 1,000,000
├─ Your Holdings: 10,000 (1%)
└─ Vault Assets: 1,050,000 STX

After Your Withdrawal (1,000 tokens):
├─ Total snSTX-BAL Supply: 999,000 (↓)
├─ Your Holdings: 9,000 (0.9%)
├─ Vault Assets: 1,049,000 STX (↓)
└─ Other users: Unaffected

Your withdraw doesn't dilute others!
Each holder's % ownership stays constant
```

### 3. **Slippage Protection**

SNP protects against unfavorable rates:

```
Expected: 1,000 snSTX → 1,052 STX
Minimum: 1,040 STX (1% slippage tolerance)

If price drops below 1,040 STX:
└─ Transaction reverts
   └─ Your tokens safe
      └─ Try again when price recovers
```

### 4. **Gas Optimization**

Withdrawal costs are optimized:

```
Small withdrawal (from reserve):
└─ Gas: ~0.001 STX

Medium withdrawal (1-2 strategies):
└─ Gas: ~0.002 STX

Large withdrawal (3+ strategies):
└─ Gas: ~0.003 STX

Still very cheap!
```

### 5. **Timing Considerations**

**Best Times to Withdraw:**
- ✅ After a harvest (max share price)
- ✅ During low gas periods
- ✅ When you need the funds

**Avoid if Possible:**
- ⚠️ Right before a harvest (miss compounding)
- ⚠️ During high network congestion
- ⚠️ Immediately after depositing (unless emergency)

---

## 🔄 Withdrawing to Different Destinations

### Standard Withdrawal
```
Default: Withdraw to your wallet
└─ Same wallet that made the deposit
   └─ STX appears in your Hiro/Leather wallet
```

### Advanced: Withdraw & Swap (Coming Soon)
```
Withdraw and immediately swap to another asset:
├─ Withdraw from vault → STX
├─ Auto-swap via ALEX → USDA
└─ Receive USDA in your wallet

One-click exit to stablecoin
```

### Advanced: Withdraw & Bridge (Phase 2)
```
Withdraw and bridge to other L2s:
├─ Withdraw from Stacks vault
├─ Bridge via sBTC
└─ Receive on Core/Rootstock

Multi-chain capital mobility
```

---

## 📊 Post-Withdrawal Tracking

### Transaction Receipt

After withdrawal, you'll receive:

```
┌─────────────────────────────────────┐
│ Withdrawal Receipt                  │
├─────────────────────────────────────┤
│ Date: Dec 25, 2024 14:23:45        │
│ Vault: Balanced Vault               │
│                                      │
│ Tokens Burned: 500 snSTX-BAL        │
│ STX Received: 526 STX               │
│ Exchange Rate: 1.052 STX/token      │
│                                      │
│ Original Deposit: 475 STX           │
│ Profit: +51 STX (+10.7%)            │
│ Time Held: 47 days                  │
│                                      │
│ Transaction: 0x9b2f...5e3d          │
│ Block: #125,492                     │
│                                      │
│ [View on Explorer]                  │
│ [Download PDF Receipt]              │
└─────────────────────────────────────┘
```

### Updated Dashboard

Your portfolio updates instantly:

```
Portfolio After Withdrawal:
├─ Total Value: 1,451 STX (was 1,977 STX)
├─ Positions: 1 vault (was 1 vault)
└─ Total Earned: 51 STX

Remaining Position:
├─ Balanced Vault: 928 snSTX-BAL
├─ Current Value: 976 STX
└─ Still earning: 12.7% APY
```

---

## 🛡️ Security Best Practices

### Pre-Withdrawal Checks

✅ **Verify wallet address** - Withdrawing to correct wallet
✅ **Check share price** - Is it reasonable?
✅ **Review gas fee** - Should be ~0.001-0.003 STX
✅ **Confirm amount** - Double-check withdrawal size
✅ **Test with small amount** - First withdrawal? Start small

### During Withdrawal

✅ **Don't rush** - Review all details carefully
✅ **Verify in wallet** - Check transaction details before signing
✅ **Save transaction ID** - For your records
✅ **Wait for confirmation** - Don't refresh or close browser
✅ **Check receipt** - Verify correct amount received

### After Withdrawal

✅ **Verify wallet balance** - STX should appear
✅ **Save receipt** - For tax records
✅ **Monitor remaining position** - Still earning yield
✅ **Report any issues** - Contact support immediately if problems

---

## ❓ Common Withdrawal Questions

### Q: Is there a minimum withdrawal amount?
**A:** No hard minimum, but very small withdrawals (<10 STX) may have proportionally higher gas costs.

### Q: How long does a withdrawal take?
**A:** Most withdrawals complete in 10-20 seconds. Large withdrawals requiring strategy freeing may take 30-90 seconds.

### Q: Can I cancel a withdrawal?
**A:** Once confirmed on-chain, no. Before confirming in your wallet, yes - just reject the transaction.

### Q: Do I pay fees to withdraw?
**A:** Zero withdrawal fees! Only standard transaction gas (~0.001-0.003 STX).

### Q: What happens to my earned yield?
**A:** All earned yield is automatically included in your withdrawal value. Your vault tokens represent both your principal and all accumulated earnings.

### Q: Can I withdraw if the vault is paused?
**A:** During emergency pause, withdrawals may be temporarily disabled for security. Normal withdrawals resume once the vault is unpaused.

### Q: Will withdrawing affect other users?
**A:** No! Each user's share is independent. Your withdrawal burns your tokens and doesn't dilute other holders.

### Q: Can I withdraw part of my position?
**A:** Yes! Withdraw any amount from 0.01% to 100% of your position.

---

## 🎯 Next Steps After Withdrawal

**If Withdrawn Fully:**
- ✅ Save tax records
- ✅ Consider reinvesting earnings
- ✅ Stay updated on SNP (new vaults, features)

**If Partial Withdrawal:**
- ✅ Monitor remaining position
- ✅ Consider rebalancing strategy
- ✅ Plan next harvest/withdrawal

**Need Help Deciding?**
- [Understanding APY](./understanding-apy.md)
- [Risk Management](./risk-management.md)
- [Fee Structure](./fees.md)
- [Join Discord](https://discord.gg/snp)

---

## 🆘 Withdrawal Issues?

### Common Issues & Solutions

**Issue: Transaction Failed**
```
Solution:
1. Check wallet STX balance for gas
2. Verify vault has sufficient liquidity
3. Try smaller withdrawal amount
4. Wait a few minutes and retry
```

**Issue: Withdrawal Taking Long Time**
```
Solution:
1. Check transaction on explorer
2. Large withdrawals take 30-90 seconds
3. Don't refresh browser during process
4. Contact support if >5 minutes
```

**Issue: Incorrect Amount Received**
```
Solution:
1. Check transaction receipt
2. Verify share price at withdrawal time
3. Account for any price movement
4. Contact support with transaction ID
```

### Get Help

- **Discord:** [discord.gg/snp](https://discord.gg/snp) (fastest)
- **Email:** mattglory14@gmail.com
- **Twitter:** [@SNP_Protocol](https://twitter.com/SNP_Protocol)

---

**Ready to manage your position? [Launch App →](https://app.snp-protocol.com)**

---

*Last updated: November 2025*
*SNP Protocol - Bitcoin L2 Yield Infrastructure*
*Developer: mattglory | Contact: mattglory14@gmail.com*
