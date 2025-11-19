# Understanding APY in SNP Vaults

Learn how Annual Percentage Yield (APY) works in SNP and what drives your returns.

---

## 📊 What is APY?

**Annual Percentage Yield (APY)** is the annualized rate of return, including the effect of compounding.

### Simple Example

```
Deposit: 10,000 STX
APY: 12%

After 1 year with monthly compounding:
= 10,000 × (1 + 0.12/12)^12
= 10,000 × 1.1268
= 11,268 STX

Your earnings: 1,268 STX
```

###

 APY vs APR

```
APR (Annual Percentage Rate):
└─ Simple interest, no compounding
   └─ 12% APR on 10,000 STX = 1,200 STX/year

APY (Annual Percentage Yield):
└─ Includes compounding
   └─ 12% APY on 10,000 STX = 1,268 STX/year

Difference: +68 STX from compounding!
```

---

## 🎯 How SNP Calculates APY

### Multi-Source Yield Model

SNP's APY comes from multiple sources:

```
Balanced Vault APY: 12.7%

Breakdown by Strategy:
├─ ALEX LP (25%):        18% APY → 4.5% contribution
├─ STX Stacking (25%):    9% APY → 2.25% contribution  
├─ Zest Lending (20%):   12% APY → 2.4% contribution
├─ Velar Pools (15%):    14% APY → 2.1% contribution
└─ Other (15%):          13% APY → 1.95% contribution
                                   ───────────────────
Base Yield:                          13.2%
+ Compounding Effect:                +1.2%
- Performance Fee (1.5%):            -1.7%
                                   ───────────────────
NET APY:                              12.7%
```

### Real-Time APY Tracking

SNP tracks APY across multiple timeframes:

```
┌─────────────────────────────────────┐
│ Balanced Vault APY                  │
├─────────────────────────────────────┤
│ Current (Live):      12.7%          │
│ 24h Average:         12.9%          │
│ 7-Day Average:       13.1%          │
│ 30-Day Average:      12.7%          │
│ All-Time Average:    12.5%          │
│                                      │
│ Displayed APY: 12.7%                │
│ (75% weight on 7-day data)          │
└─────────────────────────────────────┘
```

**Why Multiple Timeframes?**
- 24h: Shows immediate conditions
- 7-day: Balances recent vs longer trends
- 30-day: Reflects sustained performance
- All-time: Shows historical average

---

## 💰 APY Sources in Detail

### 1. **Liquidity Pool Fees (ALEX, Velar)**

Earn from traders swapping tokens:

```
ALEX STX-USDA Pool

Your Position: 10,000 STX (5,000 STX + 5,000 USDA)
Daily Volume: 1,000,000 STX
Trading Fee: 0.3%
Your Pool Share: 1%

Daily Earnings:
├─ Pool collects: 1M × 0.003 = 3,000 STX fees
├─ Your share (1%): 30 STX
└─ Annual: 30 × 365 = 10,950 STX

APY: 10,950 / 10,000 = 109.5%

(Actual APY varies with volume and your share)
```

### 2. **STX Stacking (Bitcoin Rewards)**

Earn BTC by securing the Stacks network:

```
Stacking Pool

Your Position: 10,000 STX stacked
Current Cycle: #85
BTC Rewards: 0.015 BTC per cycle
Cycle Length: ~2 weeks

Earnings per Cycle:
├─ Your reward: 0.015 BTC
├─ BTC Value: $600 (at $40k/BTC)
├─ Bi-weekly yield: $600 / $8,500 = 7%
└─ Annualized: 7% × 26 = 182%

Actual APY: ~9% (diluted by total stacking pool)
```

### 3. **Lending Interest (Zest, Arkadiko)**

Earn from borrowers paying interest:

```
Zest Protocol Lending

Your Position: 10,000 STX supplied
Current APY: 11.8%
Utilization Rate: 65%

Earnings Calculation:
├─ Base APY: 11.8%
├─ Your deposit: 10,000 STX
└─ Annual earnings: 1,180 STX

Monthly: 1,180 / 12 = 98.3 STX
Daily: 1,180 / 365 = 3.23 STX
```

### 4. **Protocol Incentives (Various)**

Additional rewards from protocols:

```
Velar Incentivized Pool

Your Position: 5,000 STX
Base APY (fees): 9%
Incentive APY (VELAR tokens): 6%

Total APY: 15%

Annual Earnings:
├─ Trading fees: 450 STX (9%)
├─ VELAR tokens: ~300 STX value (6%)
└─ Total: 750 STX (15%)

SNP auto-harvests and swaps VELAR → STX
```

### 5. **Compounding Effect**

Reinvesting earnings accelerates growth:

```
Without Compounding (12% APR):
Year 1: 10,000 + 1,200 = 11,200
Year 2: 10,000 + 2,400 = 12,400
Year 3: 10,000 + 3,600 = 13,600

With Compounding (12% APY):
Year 1: 10,000 × 1.12 = 11,200
Year 2: 11,200 × 1.12 = 12,544 (+144 STX)
Year 3: 12,544 × 1.12 = 14,049 (+449 STX)

Extra earnings from compounding: 449 STX
```

---

## 📈 APY Fluctuation

### What Causes APY Changes?

**1. Market Conditions**
```
Bull Market:
├─ High trading volume → More LP fees
├─ More borrowing → Higher lending rates
└─ Result: APY increases (13% → 18%)

Bear Market:
├─ Low trading volume → Fewer LP fees
├─ Less borrowing → Lower lending rates
└─ Result: APY decreases (13% → 9%)
```

**2. Utilization Rates**
```
Lending Protocol Example:

High Utilization (80%):
└─ APY: 15% (borrowers paying more)

Low Utilization (20%):
└─ APY: 5% (less demand)

SNP auto-rebalances to maintain optimal rates
```

**3. Incentive Programs**
```
Protocol launches incentives:
├─ ALEX doubles farming rewards
├─ Vault APY jumps 3-5%
└─ SNP captures these bonuses

Incentives end:
├─ Base APY returns
└─ SNP rebalances to next best opportunity
```

**4. Total Value Locked (TVL)**
```
Small TVL (High APY):
├─ Less competition for rewards
├─ Higher per-user yield
└─ Example: 20% APY

Large TVL (Lower APY):
├─ More competition for rewards
├─ Lower per-user yield
└─ Example: 10% APY

SNP scales strategies as TVL grows
```

### Historical APY Trends

```
Balanced Vault - 90 Day History:

Week 1:  13.2% APY (launch bonus)
Week 2:  12.8% APY (normalizing)
Week 4:  14.5% APY (new incentives)
Week 6:  11.9% APY (incentives end)
Week 8:  12.4% APY (rebalanced)
Week 10: 13.1% APY (bull market)
Week 12: 12.7% APY (current)

Average: 12.8% APY
Volatility: ±1.5% typical range
```

---

## 🎯 Maximizing Your APY

### Strategy 1: Choose the Right Vault

```
Risk vs Reward:

Conservative Vault:
├─ APY: 8-10%
├─ Volatility: Low
└─ Best for: Capital preservation

Balanced Vault:
├─ APY: 12-15%
├─ Volatility: Medium
└─ Best for: Most users

Growth Vault:
├─ APY: 18-25%
├─ Volatility: High
└─ Best for: Risk-tolerant yield seekers
```

### Strategy 2: Long-Term Holding

Compounding works best over time:

```
10,000 STX at 12.7% APY:

1 Month:   10,105 STX  (+1.05%)
3 Months:  10,318 STX  (+3.18%)
6 Months:  10,651 STX  (+6.51%)
1 Year:    11,352 STX  (+13.52%)
2 Years:   12,887 STX  (+28.87%)
3 Years:   14,626 STX  (+46.26%)

Patience = More compounding cycles
```

### Strategy 3: Reinvest Withdrawals

Don't spend all your gains:

```
Strategy: Take 50%, Reinvest 50%

Year 1 Earnings: +1,352 STX
├─ Withdraw: 676 STX (spend/save)
├─ Reinvest: 676 STX (back to vault)
└─ New balance: 10,676 STX

Year 2 Earnings: +1,445 STX (on larger base)
├─ Withdraw: 722 STX
├─ Reinvest: 722 STX
└─ New balance: 11,398 STX

Total withdrawn over 2 years: 1,398 STX
Still earning on: 11,398 STX
```

### Strategy 4: Dollar-Cost Average Deposits

Add regularly for better compound effect:

```
Strategy: $100/month for 1 year

Initial: 1,000 STX
Month 1: +100 STX
Month 2: +100 STX
...
Month 12: +100 STX

Without additions:
└─ End: 1,135 STX

With monthly additions:
└─ End: 2,335 STX
   └─ Principal: 2,200 STX
   └─ Yield: 135 STX

More capital = More compounding power
```

---

## 📊 Real APY vs Advertised APY

### What You See

```
Balanced Vault
APY: 12.7%

This is your NET APY after all fees
```

### Behind the Scenes

```
Base Strategy Yields:
├─ ALEX LP: 18.0%
├─ STX Stacking: 9.0%
├─ Zest: 11.8%
├─ Velar: 14.0%
└─ Others: 13.0%

Weighted Average: 13.2% (gross)

Adjustments:
├─ + Compounding boost: +1.2%
├─ - Performance fee (1.5%): -1.7%
└─ = NET APY: 12.7%

The 12.7% is what YOU actually earn
```

### Compare to Competitors

```
Protocol A:
├─ Advertised: 15% APY
├─ Performance fee: 20%
├─ Management fee: 2%
└─ Your NET: ~9.8% APY

Protocol B (Yearn):
├─ Advertised: 14% APY
├─ Performance fee: 20%
├─ Management fee: 2%
└─ Your NET: ~9.2% APY

SNP:
├─ Advertised: 12.7% APY
├─ Performance fee: 1.5%
├─ Management fee: 0%
└─ Your NET: 12.7% APY

SNP's displayed APY is your ACTUAL return!
```

---

## ⚠️ APY Risk Factors

### Market Risks

```
Risk: Trading volume drops
Impact: LP fees decrease
Example: 15% APY → 10% APY (-33%)

Risk: Crypto bear market
Impact: Lower yields across board
Example: 12% APY → 8% APY (-33%)

Risk: Stacking rewards decline
Impact: Lower BTC rewards
Example: 9% APY → 6% APY (-33%)
```

### Protocol Risks

```
Risk: Partner protocol exploit
Impact: Potential loss of funds in that strategy
Mitigation: Diversified across 12+ protocols

Risk: Smart contract bug
Impact: Potential vault exploit
Mitigation: 100% test coverage, audits

Risk: Impermanent loss (LP strategies)
Impact: IL can reduce overall returns
Mitigation: Balanced pool selection, monitoring
```

### Competitive Risks

```
Risk: New competitors launch
Impact: Users move capital, APY rises for remaining
Note: More competition can increase yields

Risk: Liquidity drain
Impact: Harder to deploy/withdraw efficiently
Mitigation: Reserve management, multi-strategy
```

---

## 💡 APY Best Practices

### Do's ✅

✅ **Understand the source** - Know where yields come from
✅ **Check multiple timeframes** - Don't rely on 24h APY alone
✅ **Compare net APYs** - Factor in all fees
✅ **Monitor trends** - Watch for sustainable vs temporary spikes
✅ **Diversify vaults** - Spread across risk profiles
✅ **Think long-term** - Compounding needs time
✅ **Reinvest gains** - Accelerate growth

### Don'ts ❌

❌ **Chase high APY** - Often comes with high risk
❌ **Ignore fees** - Net APY is what matters
❌ **Expect stability** - DeFi APYs fluctuate
❌ **Withdraw too early** - Miss compounding effect
❌ **Forget tax implications** - Yields may be taxable
❌ **Trust unsustainable yields** - If it looks too good...
❌ **Ignore risk factors** - Higher APY = higher risk

---

## 🧮 APY Calculators

### Manual Calculation

```clarity
;; SNP APY Formula

future_value = present_value × (1 + apy/365)^days

Example:
├─ Deposit: 10,000 STX
├─ APY: 12.7% (0.127)
├─ Days: 90

Calculation:
future_value = 10,000 × (1 + 0.127/365)^90
             = 10,000 × (1.000348)^90
             = 10,000 × 1.0318
             = 10,318 STX

Earnings: 318 STX in 90 days
```

### Online Calculator (Coming Soon)

Visit [app.snp-protocol.com/calculator](https://app.snp-protocol.com/calculator):

```
Enter:
├─ Deposit Amount: 10,000 STX
├─ Vault Type: Balanced
├─ Time Period: 1 year
└─ Reinvest: Yes

Results:
├─ Final Value: 11,352 STX
├─ Total Earnings: 1,352 STX
├─ Effective APY: 13.52%
└─ After Tax (30%): 10,946 STX
```

---

## ❓ APY FAQ

### Q: Why does APY change daily?
**A:** APY responds to market conditions, trading volume, utilization rates, and protocol incentives. Daily fluctuations of ±0.5-1% are normal.

### Q: Is the displayed APY guaranteed?
**A:** No. Displayed APY is based on recent performance and is not a guarantee of future returns. Past performance ≠ future results.

### Q: Which APY timeframe is most accurate?
**A:** The 30-day average provides the best balance between recency and stability. SNP uses a weighted average favoring 7-day data.

### Q: Can APY go negative?
**A:** Theoretically yes, if losses exceed gains. SNP's diversification across 12+ strategies makes this highly unlikely, but not impossible in extreme market conditions.

### Q: How often is APY calculated?
**A:** Share price updates with every harvest (24-72 hours). APY is recalculated in real-time based on share price movement.

### Q: Why is SNP's APY lower than some competitors?
**A:** SNP displays NET APY after all fees. Many competitors show GROSS APY before fees. SNP's actual returns are often higher due to lower fees (1.5% vs 20-25%).

### Q: What's a "good" APY in DeFi?
**A:** Context-dependent:
- Stablecoins: 5-15% is good
- STX: 8-20% is reasonable
- High-risk: 20%+ possible but risky
- SNP's 8-15% range is competitive and sustainable

---

## 🎯 Next Steps

**Learn More:**
- [Risk Management](./risk-management.md) - Balance risk and reward
- [Fee Structure](./fees.md) - Understand all costs
- [Depositing Guide](./depositing.md) - Start earning

**Advanced Topics:**
- [How It Works](../getting-started/how-it-works.md) - Technical details
- [Strategy Breakdown](../developer-guide/contracts.md) - Deep dive

**Get Help:**
- [FAQ](../faq.md) - Common questions
- [Discord](https://discord.gg/snp) - Community support
- [Email](mailto:mattglory14@gmail.com) - Direct support

---

**Ready to start earning? [Launch App →](https://app.snp-protocol.com)**

---

*Last updated: November 2025*
*SNP Protocol - Bitcoin L2 Yield Infrastructure*
*Developer: mattglory | Contact: mattglory14@gmail.com*
*Yields are variable and not guaranteed. Past performance does not indicate future results. Cryptocurrency investments carry risk.*
