# Frequently Asked Questions (FAQ)

Common questions about SNP Protocol answered in detail.

---

## 🎯 General Questions

### What is SNP Protocol?

SNP (Stacks Nexus Protocol) is the first automated yield aggregator for Bitcoin Layer 2, bringing Yearn Finance-style automation to the Stacks ecosystem. We automatically optimize your Bitcoin L2 yields across 12+ DeFi protocols.

### How is SNP different from other yield aggregators?

**Key Differences:**
- **Bitcoin L2 Native:** Built specifically for Stacks and Bitcoin ecosystem
- **Lower Fees:** 1.5% performance fee vs 20% typical
- **First Mover:** No competition in automated Bitcoin L2 yield
- **Native Bitcoin Yield:** Earn BTC rewards through STX Stacking
- **Production Ready:** 100% test coverage, proven architecture

### Is SNP safe?

**Security Measures:**
- ✅ 100% test coverage (28/28 tests passing)
- ✅ Zero compilation errors
- ✅ Emergency pause functionality
- ✅ Diversified across 12+ protocols
- ✅ Open-source code for transparency
- ❌ Not yet audited (planned Q1 2025)

**However:** ALL DeFi carries risks. Only invest what you can afford to lose.

### Who is behind SNP?

SNP is developed by Glory, a Code4STX grant recipient with 2 years of software development experience and 4 months of Stacks blockchain development. This is Glory's fourth Code4STX project.

---

## 💰 Deposits & Withdrawals

### How do I deposit?

1. Connect wallet (Hiro or Leather)
2. Choose vault (Conservative, Balanced, or Growth)
3. Enter amount
4. Confirm transaction
5. Start earning!

[Detailed Guide →](./user-guide/depositing.md)

### Is there a minimum deposit?

Yes, 100 STX minimum per vault. Recommended: 500+ STX for gas efficiency.

### Can I withdraw anytime?

Yes! No lock-up periods. Withdraw 24/7, any amount. Most withdrawals complete in 10-20 seconds.

### Are there withdrawal fees?

No! SNP charges:
- ✅ 0% withdrawal fee
- ✅ 0% deposit fee
- ✅ 1.5% performance fee (only on profits)
- Only standard transaction gas (~0.001 STX)

### How long does withdrawal take?

**Instant (most common):** If vault has sufficient reserves
**Fast (occasionally):** 30-90 seconds if freeing from strategies
**Large withdrawals:** May take 1-2 minutes for >5% of vault TVL

---

## 📊 Returns & APY

### What returns can I expect?

**Target APYs (after fees):**
- Conservative Vault: 8-10%
- Balanced Vault: 12-15%
- Growth Vault: 18-25%

**Note:** Returns vary with market conditions and are NOT guaranteed.

### How is APY calculated?

APY is calculated from recent performance across multiple timeframes (24h, 7d, 30d) weighted toward recent data. Displayed APY is NET after all fees.

[Detailed Explanation →](./user-guide/understanding-apy.md)

### Can I lose money?

**Yes.** While SNP aims to generate positive returns, risks include:
- Smart contract exploits
- Protocol hacks
- Market volatility
- Impermanent loss (in LP strategies)

[Risk Management Guide →](./user-guide/risk-management.md)

### How does compounding work?

SNP automatically harvests yields every 24-72 hours and reinvests them. Your share price increases, representing your growing balance.

Example:
```
Day 1:  1 snSTX = 1.00 STX
Day 30: 1 snSTX = 1.012 STX (+1.2%)
Day 60: 1 snSTX = 1.025 STX (+2.5%)
```

---

## 💸 Fees

### What fees does SNP charge?

**Only ONE fee:**
- Performance Fee: 1.5% of profits

**NO other fees:**
- ✅ 0% management fee
- ✅ 0% deposit fee
- ✅ 0% withdrawal fee

[Complete Fee Breakdown →](./user-guide/fees.md)

### How does 1.5% compare to competitors?

**Much lower:**
- Yearn Finance: 20% performance + 2% management
- Traditional funds: 20% performance + 2% management
- Beefy Finance: 4.5% performance

You keep **98.5%** of all profits with SNP.

### When are fees charged?

During harvest cycles (every 24-72 hours) when profits are realized. Fees are deducted automatically before compounding.

### Do I pay fees if I lose money?

No. Performance fees are ONLY charged on profits, never on losses or principal.

---

## 🔐 Security

### Has SNP been audited?

Not yet. Security audit is scheduled for Q1 2025. Until then, SNP relies on:
- 100% test coverage
- Proven Yearn Finance architecture patterns
- Open-source code review
- Comprehensive devnet testing

### What if a protocol gets hacked?

**Strategy Isolation:** Each strategy is a separate contract. If one fails, others are unaffected.

**Example:** If ALEX (25% allocation) is exploited, you'd lose ~25%, not 100%. Other strategies continue operating normally.

### Can SNP get hacked?

**Possible, yes.** All DeFi carries smart contract risk. SNP mitigates through:
- Comprehensive testing
- Emergency pause controls
- Diversification across protocols
- Proven architecture patterns

But absolute safety cannot be guaranteed.

### What emergency controls exist?

- **Vault Pause:** Stop all deposits/withdrawals
- **Strategy Pause:** Isolate specific strategy
- **Emergency Exit:** Withdraw all funds from compromised strategy
- **Multi-sig Admin:** Requires multiple signatures for critical actions

---

## 🎮 Using SNP

### Which vault should I choose?

**Choose based on risk tolerance:**

**Conservative (8-10% APY):**
- Best for: Capital preservation
- Risk: Low (2/5)
- LP Exposure: 20%

**Balanced (12-15% APY):**
- Best for: Most users
- Risk: Medium (3/5)
- LP Exposure: 40%

**Growth (18-25% APY):**
- Best for: Risk-tolerant yield seekers
- Risk: High (4/5)
- LP Exposure: 60%

### Can I use multiple vaults?

Yes! Deposit in multiple vaults simultaneously for diversification.

### How often should I check my position?

Your choice! Many users check:
- Weekly: Monitor performance
- Monthly: Rebalance if needed
- Never: Set and forget (truly automated)

### Should I withdraw profits regularly?

**Depends on your goals:**

**Compound everything:** Maximum long-term growth
**Harvest some profits:** Balance safety and growth
**Regular withdrawals:** Income generation strategy

[Withdrawal Strategies →](./user-guide/withdrawing.md)

---

## 🔧 Technical Questions

### What blockchain is SNP on?

**Stacks (Bitcoin Layer 2)**

Stacks settles transactions on Bitcoin, combining Bitcoin's security with smart contract functionality.

### What programming language?

**Clarity** - Stacks' smart contract language. Benefits:
- Decidable (no runtime surprises)
- Non-Turing complete (security)
- Native Bitcoin integration

### Can I integrate SNP into my app?

Yes! SNP is composable. You can:
- Integrate vaults into your protocol
- Build on top of SNP infrastructure
- White-label vaults for your users

[Integration Guide →](./integration-guide/protocol-integration.md)

### Can I build strategies for SNP?

Yes! SNP has a strategy marketplace where:
- Anyone can submit strategies
- Governance approves strategies
- Creators earn 0.3% of performance fees

[Strategy Development Guide →](./strategy-development/creating-strategies.md)

---

## 🌍 Bitcoin & Stacks

### What is Bitcoin Layer 2?

Layer 2 (L2) solutions process transactions off Bitcoin's main chain while inheriting its security. Stacks is the leading Bitcoin L2.

### What is STX?

STX is the native token of Stacks blockchain. Used for:
- Transaction fees
- Smart contract execution
- Stacking (earning BTC rewards)
- DeFi operations

### What is sBTC?

sBTC is a 1:1 Bitcoin-pegged asset on Stacks. Benefits:
- Trust-minimized Bitcoin wrapper
- Earn DeFi yields on your BTC
- Seamless Stacks integration

Launched November 2024, sBTC is revolutionizing Bitcoin DeFi.

### What is Stacking?

Stacking is Stacks' consensus mechanism where STX holders:
- Lock STX for ~2 week cycles
- Earn BTC rewards (~9% APY)
- Secure the network

SNP includes Stacking strategies for Bitcoin yield.

---

## 💼 Business & Partnerships

### Can protocols integrate SNP?

Yes! SNP offers:
- White-label vaults
- Protocol integrations
- Revenue sharing
- Custom vault deployment

[Contact us →](mailto:partnerships@snp-protocol.com)

### How do I become a strategy creator?

1. Learn Clarity smart contracts
2. Build strategy following our guidelines
3. Test thoroughly on devnet
4. Submit via governance
5. Earn 0.3% of performance fees

[Strategy Creation Guide →](./strategy-development/creating-strategies.md)

### Is SNP open source?

Yes! Fully open source:
- GitHub: [github.com/Glory-mj/snp-mvp](https://github.com/Glory-mj/snp-mvp)
- License: MIT
- Community contributions welcome

---

## 📱 Platform & Support

### Is there a mobile app?

Not yet. Currently accessible via:
- Web app (desktop)
- Web app (mobile browser)

Native mobile apps planned for 2025.

### What wallets are supported?

Currently:
- ✅ Hiro Wallet
- ✅ Leather Wallet

More wallet integrations coming soon.

### How do I get support?

**Community Support (Fastest):**
- Discord: [discord.gg/snp](https://discord.gg/snp)
- Twitter: [@SNP_Protocol](https://twitter.com/SNP_Protocol)

**Direct Support:**
- Email: support@snp-protocol.com
- GitHub Issues: [Report bugs](https://github.com/Glory-mj/snp-mvp/issues)

### Is there a Discord/Telegram?

Yes! Join our community:
- **Discord:** [discord.gg/snp](https://discord.gg/snp) (primary)
- **Twitter:** [@SNP_Protocol](https://twitter.com/SNP_Protocol)
- Telegram: Coming soon

---

## 🗓️ Roadmap & Future

### What's next for SNP?

**Phase 1 (Q1 2025):**
- Security audit
- Mainnet launch
- ALEX partnership integration
- Community governance activation

**Phase 2 (Q2 2025):**
- sBTC strategies launch
- Cross-Bitcoin-L2 deployment
- Strategy marketplace opening
- Mobile apps

**Phase 3 (Q3 2025+):**
- AI-powered allocation
- Institutional products
- More Bitcoin L2 integrations

[Full Roadmap →](./roadmap.md)

### Will SNP support other L2s?

Yes! Plans to expand to:
- Core DAO
- Rootstock
- Other Bitcoin L2s

Multi-chain Bitcoin yield aggregation.

### Will there be a token?

**Not announced yet.** Governance structure is being designed. Community will be informed well in advance of any token launch.

---

## 🌟 Comparing SNP

### SNP vs Yearn Finance?

| Feature | Yearn | SNP |
|---------|-------|-----|
| Ecosystem | Ethereum | Bitcoin L2 |
| Performance Fee | 20% | 1.5% |
| Management Fee | 2% | 0% |
| User Keeps | ~78% | 98.5% |
| First Mover | No | Yes |

### SNP vs Manual Yield Farming?

| Feature | Manual | SNP |
|---------|--------|-----|
| Time | Hours/week | Zero |
| Protocols | 1-3 | 12+ |
| Rebalancing | Manual | Automatic |
| Compounding | Manual | Continuous |
| Fees | Gas only | 1.5% + gas |

### SNP vs Staking?

| Feature | Solo Staking | SNP |
|---------|--------------|-----|
| APY | ~9% (BTC) | 12-15% |
| Diversification | Single strategy | 12+ strategies |
| Liquidity | Locked | Anytime |
| Management | Manual | Automated |

---

## ⚠️ Important Disclaimers

### Investment Disclaimer

**SNP Protocol does not provide:**
- Investment advice
- Financial planning services
- Tax guidance
- Legal advice

**Always:**
- Do your own research
- Consult professionals
- Only invest surplus capital
- Understand the risks

### Risk Disclaimer

**Cryptocurrency investing involves substantial risk:**
- Possible total loss of funds
- Smart contract vulnerabilities
- Market volatility
- Regulatory uncertainty

**Past performance does not guarantee future results.**

### No Guarantees

**SNP makes NO guarantees of:**
- Specific returns or APY
- Safety of deposited funds
- Availability of withdrawals
- Protocol uptime

**Use at your own risk.**

---

## 📚 Additional Resources

### Learn More

- [What is SNP?](./getting-started/what-is-snp.md)
- [How It Works](./getting-started/how-it-works.md)
- [Risk Management](./user-guide/risk-management.md)
- [Security Model](./security/model.md)

### For Developers

- [Architecture Overview](./developer-guide/overview.md)
- [Smart Contract Docs](./developer-guide/contracts.md)
- [Integration Guide](./integration-guide/protocol-integration.md)

### Community

- [Discord](https://discord.gg/snp)
- [Twitter](https://twitter.com/SNP_Protocol)
- [GitHub](https://github.com/Glory-mj/snp-mvp)
- [Blog](https://blog.snp-protocol.com)

---

## ❓ Still Have Questions?

**Can't find your answer?**

1. Search this FAQ (Ctrl+F / Cmd+F)
2. Check our [documentation](./README.md)
3. Ask in [Discord](https://discord.gg/snp)
4. Email: support@snp-protocol.com

**We're here to help!**

---

*Last updated: November 2025*
*SNP Protocol - Bitcoin L2 Yield Infrastructure*
