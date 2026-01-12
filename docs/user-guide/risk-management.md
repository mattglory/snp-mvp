# Risk Management in SNP Vaults

Understanding and managing risk is essential for successful DeFi investing. Learn how SNP helps you balance risk and reward.

---

## 🎯 Understanding Risk in DeFi

### Risk vs Reward Spectrum

```
Lower Risk ←──────────────────────→ Higher Risk
Lower Reward                    Higher Reward

Conservative    Balanced      Growth
   8-10%        12-15%       18-25%
  ████░░        ██████░      ████████
   
Risk Score:    Risk Score:   Risk Score:
    2/5           3/5           4/5
```

---

## 📊 SNP's Risk Framework

### 5-Point Risk Scoring System

Every vault and strategy is rated on a 1-5 scale:

**1/5 - Ultra Safe (Coming Soon)**
```
Characteristics:
├─ 100% stablecoin strategies
├─ No impermanent loss risk
├─ Minimal smart contract exposure
└─ Target APY: 5-7%

Example: USDA Lending Only Vault
```

**2/5 - Conservative** ⭐ Lowest Risk Available
```
Characteristics:
├─ 50%+ in STX Stacking (proven model)
├─ Rest in established lending protocols
├─ Minimal impermanent loss
└─ Target APY: 8-10%

Current Vault: Conservative Vault
Allocation:
├─ 50% STX Stacking (BTC rewards)
├─ 30% Zest/Arkadiko lending
└─ 20% Blue-chip LP (STX-USDA)
```

**3/5 - Balanced** ⭐ Most Popular
```
Characteristics:
├─ Diversified across multiple strategies
├─ Mix of stacking, lending, and LPs
├─ Moderate impermanent loss
└─ Target APY: 12-15%

Current Vault: Balanced Vault
Allocation:
├─ 25% STX Stacking
├─ 25% ALEX DEX
├─ 20% Zest Lending
├─ 15% Velar Pools
└─ 15% Mixed strategies
```

**4/5 - Growth** ⭐ Higher Risk/Reward
```
Characteristics:
├─ Focus on high-yield opportunities
├─ More LP exposure (impermanent loss)
├─ Includes leveraged strategies
└─ Target APY: 18-25%

Current Vault: Growth Vault
Allocation:
├─ 35% High-yield LPs
├─ 25% Leveraged strategies
├─ 20% New protocol opportunities
└─ 20% sBTC strategies
```

**5/5 - Aggressive (Phase 2)**
```
Characteristics:
├─ Maximum yield focus
├─ Heavy leverage usage
├─ New/unproven protocols
└─ Target APY: 25%+

Note: Only for experienced users
Requires explicit risk acknowledgment
```

---

## ⚠️ Risk Categories

### 1. Smart Contract Risk

**What It Is:**
Bugs or exploits in smart contract code that could lead to loss of funds.

**SNP's Mitigation:**
```
✅ 100% Test Coverage
├─ 28/28 tests passing
├─ All edge cases covered
└─ Continuous testing on devnet

✅ Code Audits
├─ External security review (planned)
├─ Open-source code
└─ Community scrutiny

✅ Emergency Controls
├─ Pause functionality
├─ Emergency withdrawals
└─ Strategy isolation

✅ Gradual Rollout
├─ Start with tested strategies
├─ Proven protocol partners
└─ Monitor performance closely
```

**Your Actions:**
- ✅ Start with smaller deposits
- ✅ Understand the technology
- ✅ Monitor vault announcements
- ✅ Use emergency pause if issues arise

**Risk Level by Vault:**
```
Conservative: Low (established protocols only)
Balanced: Medium (mix of proven + newer)
Growth: Higher (includes newer protocols)
```

---

### 2. Impermanent Loss Risk

**What It Is:**
Loss compared to holding assets separately, caused by price divergence in liquidity pools.

**How It Works:**
```
Example: ALEX STX-USDA Pool

Deposit:
├─ 500 STX @ $0.85 = $425
├─ 500 USDA = $500
└─ Total: $925

Scenario 1: STX doubles to $1.70
├─ If held separately: $1,350
├─ In LP: $1,240 (impermanent loss)
└─ Loss: $110 (8%)

BUT: Trading fees may offset
├─ LP fees earned: $150
└─ Net gain: $40 despite IL
```

**SNP's Mitigation:**
```
✅ Balanced Pool Selection
├─ Choose less volatile pairs (STX-USDA)
├─ Avoid extreme pairs (meme-BTC)
└─ Monitor correlation

✅ Fee Optimization
├─ High-volume pools
├─ Fee income offsets IL
└─ Regular rebalancing

✅ Strategic Allocation
├─ Conservative: 20% LP exposure max
├─ Balanced: 40% LP exposure
└─ Growth: 60% LP exposure

✅ Position Monitoring
├─ Track IL in real-time
├─ Exit if IL exceeds threshold
└─ Rebalance to safer strategies
```

**Your Actions:**
- ✅ Choose vaults with lower LP exposure
- ✅ Understand correlation between paired assets
- ✅ Accept IL as cost of earning fees
- ✅ Focus on net returns (fees - IL)

**Risk Level by Vault:**
```
Conservative: Low (20% LP exposure)
Balanced: Medium (40% LP exposure)
Growth: Higher (60% LP exposure)
```

---

### 3. Protocol Risk

**What It Is:**
Risk that a partner protocol (ALEX, Zest, etc.) gets exploited or fails.

**Recent DeFi Exploits:**
```
2023 Examples:
├─ Euler Finance: $197M exploit
├─ Platypus Finance: $8.5M exploit
└─ Sentiment: $1M exploit

Risk is real in DeFi!
```

**SNP's Mitigation:**
```
✅ Diversification
├─ 12+ different protocols
├─ No single protocol > 35%
└─ Spread risk across ecosystem

✅ Protocol Vetting
├─ Audited protocols preferred
├─ Track record evaluation
├─ Community reputation check
└─ TVL and volume metrics

✅ Position Limits
Conservative Vault:
├─ Max per protocol: 25%
├─ Focus on proven protocols
└─ Avoid new/risky protocols

Growth Vault:
├─ Max per protocol: 35%
├─ Can include newer protocols
└─ Higher risk tolerance

✅ Emergency Response
├─ Individual strategy pause
├─ Rapid fund withdrawal
└─ Community alerts
```

**Your Actions:**
- ✅ Know which protocols are used
- ✅ Research partner protocols independently
- ✅ Stay updated on DeFi security news
- ✅ Report suspicious activity immediately

**Risk Level by Vault:**
```
Conservative: Low (only established protocols)
Balanced: Medium (mix of proven + emerging)
Growth: Higher (includes newer opportunities)
```

---

### 4. Liquidity Risk

**What It Is:**
Risk of being unable to withdraw due to insufficient liquidity.

**Scenarios:**
```
Scenario 1: Bank Run
├─ Many users withdraw simultaneously
├─ Vault needs to free funds from strategies
└─ May take 1-2 blocks to process

Scenario 2: Strategy Lockup
├─ Funds locked in time-based protocol
├─ Can't withdraw until unlock period
└─ Rare but possible

Scenario 3: Low Liquidity Pool
├─ LP withdrawal causes high slippage
├─ Exit costs more than expected
└─ Affects large withdrawals
```

**SNP's Mitigation:**
```
✅ Withdrawal Reserves
├─ 3-5% kept in vault as buffer
├─ Instant withdrawals for most users
└─ Covers normal demand

✅ Unlocked Strategies
├─ Avoid long lockup periods
├─ Prefer liquid strategies
└─ Emergency exit capability

✅ Gradual Withdrawal Queue
If demand exceeds supply:
├─ First-come, first-served
├─ Process withdrawals in batches
└─ Transparent queue status

✅ Multi-Protocol Sourcing
├─ Free from multiple strategies
├─ Reduce single-point bottleneck
└─ Flexible rebalancing
```

**Your Actions:**
- ✅ Don't panic-withdraw with others
- ✅ Plan withdrawals in advance if large
- ✅ Understand vault has 95%+ deployed
- ✅ Be patient during high-demand periods

**Risk Level by Vault:**
```
All Vaults: Low (3-5% reserves maintained)
Large Withdrawals: May take 1-2 minutes
Normal Withdrawals: Instant
```

---

### 5. Market Risk

**What It Is:**
General cryptocurrency market volatility affecting asset values.

**Impact Example:**
```
Bull Market (2024):
├─ BTC: $60k → $100k (+67%)
├─ STX follows correlation
├─ Vault value increases
└─ APY may temporarily decrease

Bear Market (2022):
├─ BTC: $60k → $20k (-67%)
├─ STX follows correlation  
├─ Vault value decreases
└─ APY remains positive

Your 10,000 STX in vault:
Bull: 10,000 STX = $10k → $16.7k (+67%)
Bear: 10,000 STX = $10k → $3.3k (-67%)

BUT: You still have 10,000+ STX!
     (Plus earned yields)
```

**SNP's Approach:**
```
✅ STX-Denominated Returns
├─ Measure performance in STX, not USD
├─ You earn more STX regardless of price
└─ USD value follows market

✅ Diversified Yield Sources
├─ Stacking earns BTC (uncorrelated)
├─ Lending has stable demand
└─ LP fees continue in all markets

✅ Bear Market Strategies (Phase 2)
├─ Increase stablecoin exposure
├─ Focus on lending yields
└─ Reduce LP volatility exposure
```

**Your Actions:**
- ✅ Invest only what you can hold long-term
- ✅ Focus on STX-denominated gains
- ✅ Don't panic sell in downturns
- ✅ DCA during bear markets (buy the dip)
- ✅ Remember: yield keeps compounding

**Risk Level:**
```
Market risk affects ALL crypto
SNP can't eliminate market risk
But: Earning yield softens downturns
```

---

### 6. Regulatory Risk

**What It Is:**
Risk of regulatory changes affecting DeFi or crypto broadly.

**Potential Scenarios:**
```
Scenario 1: KYC Requirements
├─ Regulators require user verification
├─ May limit anonymous access
└─ Could affect vault availability

Scenario 2: Protocol Restrictions
├─ Certain DeFi activities restricted
├─ May need to pause some strategies
└─ Adapt to new regulations

Scenario 3: Tax Changes
├─ New crypto tax rules
├─ May affect net returns
└─ Users responsible for compliance
```

**SNP's Approach:**
```
✅ Decentralized Architecture
├─ No central point of control
├─ Open-source contracts
└─ Censorship-resistant

✅ Compliance Ready
├─ Transparent operations
├─ Track all transactions
└─ Support user tax reporting

✅ Adaptive Strategy
├─ Monitor regulatory landscape
├─ Adjust as needed
└─ Prioritize user protection
```

**Your Actions:**
- ✅ Understand your local crypto regulations
- ✅ Consult tax professionals
- ✅ Keep detailed records
- ✅ Stay informed on regulatory changes

---

## 🛡️ SNP's Multi-Layer Risk Management

### Layer 1: Vault Level

```
Conservative Vault:
├─ Risk Score: 2/5
├─ Protocol Diversity: 6-8 protocols
├─ Max Single Strategy: 25%
├─ LP Exposure: ≤20%
└─ Emergency Reserve: 5%

Balanced Vault:
├─ Risk Score: 3/5
├─ Protocol Diversity: 8-10 protocols
├─ Max Single Strategy: 30%
├─ LP Exposure: ≤40%
└─ Emergency Reserve: 5%

Growth Vault:
├─ Risk Score: 4/5
├─ Protocol Diversity: 10-12 protocols
├─ Max Single Strategy: 35%
├─ LP Exposure: ≤60%
└─ Emergency Reserve: 3%
```

### Layer 2: Strategy Level

```
Each strategy has:
├─ Individual risk assessment
├─ Performance monitoring
├─ Emergency exit capability
├─ Position limits
└─ Regular audits
```

### Layer 3: Protocol Level

```
Partner protocols must have:
├─ Audit history
├─ Proven track record (3+ months)
├─ Reasonable TVL ($1M+ preferred)
├─ Active development
└─ Strong community
```

### Layer 4: User Level

```
You control:
├─ Which vault to use
├─ How much to deposit
├─ When to withdraw
├─ Risk tolerance level
└─ Portfolio diversification
```

---

## 📋 Risk Checklist Before Depositing

### Essential Checks ✅

```
□ Understand vault risk score (2/5, 3/5, 4/5)
□ Read strategy allocations
□ Know partner protocols used
□ Verify withdrawal liquidity
□ Check current APY trends
□ Review fee structure
□ Understand impermanent loss (for LP strategies)
□ Confirm you can afford potential loss
□ Have emergency fund separate from crypto
□ Understand smart contract risks
□ Know how to use emergency pause
□ Bookmarked SNP status page
□ Joined Discord for alerts
□ Understand this is DeFi (not FDIC insured)
□ Comfortable with chosen risk level
```

---

## 🎯 Portfolio Diversification Strategies

### Strategy 1: Multi-Vault Approach

```
Conservative Portfolio (Low Risk):
├─ 60% Conservative Vault
├─ 30% Balanced Vault
└─ 10% Growth Vault
Blended APY: ~10.5%
Risk Score: 2.4/5

Balanced Portfolio (Medium Risk):
├─ 30% Conservative Vault
├─ 50% Balanced Vault
└─ 20% Growth Vault
Blended APY: ~13%
Risk Score: 3.1/5

Aggressive Portfolio (High Risk):
├─ 20% Conservative Vault
├─ 30% Balanced Vault
└─ 50% Growth Vault
Blended APY: ~16%
Risk Score: 3.6/5
```

### Strategy 2: Time-Based Risk Ladder

```
Age-Based Allocation:

20-30 years old (Long horizon):
└─ 70% Growth, 30% Balanced

30-40 years old (Medium horizon):
└─ 50% Balanced, 30% Growth, 20% Conservative

40-50 years old (Shorter horizon):
└─ 50% Conservative, 40% Balanced, 10% Growth

50+ years old (Near retirement):
└─ 70% Conservative, 30% Balanced
```

### Strategy 3: Capital Allocation

```
Crypto Portfolio Breakdown:

Total Crypto: $10,000

├─ 40% Long-term hold (BTC, ETH): $4,000
├─ 30% SNP Conservative: $3,000
├─ 20% SNP Balanced: $2,000
├─ 10% SNP Growth: $1,000
└─ Emergency cash: Outside of crypto

Benefits:
✓ Diversified across strategies
✓ Balanced risk exposure
✓ Maintain core holdings
✓ Earn yield on portion
```

---

## 🚨 Warning Signs & Red Flags

### When to Reduce Exposure

```
⚠️ APY Drops Suddenly (>50%)
Action: Review strategy performance
Consider: Moving to different vault

⚠️ Partner Protocol Exploit
Action: Check if affected
Consider: Wait for SNP team response

⚠️ High Withdrawal Activity
Action: Monitor vault liquidity
Consider: Secure your position if needed

⚠️ Unusual Contract Behavior
Action: Check Discord/Twitter
Consider: Emergency pause if severe

⚠️ Personal Risk Tolerance Changed
Action: Rebalance portfolio
Consider: Move to lower-risk vault
```

### When to Exit Completely

```
🚩 Major Security Breach
🚩 Prolonged System Issues
🚩 Regulatory Ban in Your Jurisdiction
🚩 Personal Financial Emergency
🚩 Loss of Confidence in Protocol

Always prioritize your safety!
```

---

## 💡 Risk Management Best Practices

### Do's ✅

✅ **Start Small** - Test with amount you're comfortable losing
✅ **Diversify** - Use multiple vaults and strategies
✅ **Stay Informed** - Join Discord, follow Twitter, read updates
✅ **Understand Risks** - Know what you're investing in
✅ **Have Exit Plan** - Know when/why you'd withdraw
✅ **Keep Emergency Fund** - Outside of crypto entirely
✅ **Regular Monitoring** - Check performance weekly
✅ **Risk-Appropriate Allocation** - Match vault to your tolerance

### Don'ts ❌

❌ **Invest Rent Money** - Only invest surplus capital
❌ **Chase High APY** - Higher yield = higher risk
❌ **Panic Sell** - Crypto is volatile, expect swings
❌ **Ignore Warnings** - Pay attention to protocol alerts
❌ **Over-Leverage** - Don't borrow to invest in DeFi
❌ **Neglect Security** - Protect your wallet/keys
❌ **Expect Guarantees** - No returns are guaranteed
❌ **Invest Without Research** - Understand before depositing

---

## 📚 Risk Resources

### Learn More

- **[Smart Contract Security](../security/model.md)** - How SNP protects your funds
- **[Emergency Procedures](../security/emergency.md)** - What to do in crisis
- **[Audit Reports](../security/audits.md)** - Independent security reviews
- **[How It Works](../getting-started/how-it-works.md)** - Technical architecture

### Get Help

- **Discord:** [discord.gg/snp](https://discord.gg/snp) - Real-time support
- **Twitter:** [@SNP_Protocol](https://twitter.com/SNP_Protocol) - Updates
- **Email:** security@snp-protocol.com - Report issues
- **Emergency:** [status.snp-protocol.com](https://status.snp-protocol.com)

---

## ❓ Risk FAQ

### Q: What's the worst-case scenario?
**A:** Complete loss of deposited funds due to exploit or hack. This is true for ALL DeFi. While SNP implements extensive protections, smart contract risk always exists.

### Q: Has SNP been audited?
**A:** Audit is scheduled. Until then, SNP relies on comprehensive testing (100% coverage) and proven design patterns from Yearn Finance.

### Q: Can I lose more than I deposit?
**A:** No. You can only lose what you deposit. SNP doesn't use leverage that could create negative balances (except in specific Growth Vault strategies marked clearly).

### Q: How do I know my funds are safe?
**A:** You don't have absolute certainty - this is DeFi. You trust: 1) The code (open-source, tested), 2) The protocols (established partners), 3) The architecture (diversified strategies).

### Q: What if a strategy fails?
**A:** That strategy's allocation would be lost, but other strategies remain unaffected. Example: If ALEX (25% allocation) is exploited, you'd lose ~25%, not 100%.

### Q: Should I use SNP?
**A:** Only if:
- ✅ You understand DeFi risks
- ✅ You can afford to lose your deposit
- ✅ You're investing surplus capital
- ✅ You've researched thoroughly
- ✅ You're comfortable with chosen risk level

---

**Risk Disclaimer:**
*Cryptocurrency and DeFi investing involves substantial risk of loss. SNP Protocol makes no guarantees of returns or safety of funds. Past performance does not indicate future results. Only invest what you can afford to lose. Consult financial and legal professionals before investing. By using SNP, you acknowledge and accept all risks.*

---

*Last updated: November 2025*
*SNP Protocol - Bitcoin L2 Yield Infrastructure*
