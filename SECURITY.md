# Security Policy

## Current Security Status

SNP Protocol is currently in **testnet** phase. While the code has been thoroughly tested (111 tests passing, 84% coverage), it has NOT yet undergone a professional security audit.

**Do not use this on mainnet with real funds until a security audit has been completed.**

---

## Reporting Security Issues

If you find a security vulnerability, please report it responsibly.

### DO:
- Email details to: mattglory14@gmail.com
- Include steps to reproduce
- Give me reasonable time to fix before public disclosure
- Suggest a fix if you have one

### DON'T:
- Open a public GitHub issue
- Tweet about it
- Try to exploit it for profit

I'll respond within 24-48 hours and work with you on a fix.

---

## Known Security Considerations

### What's Implemented

**First Depositor Protection**
- Minimum 1000 STX required for first deposit
- Dead shares minted to burn address
- Prevents inflation attacks on share price
- Standard pattern used by leading DeFi protocols

**Slippage Controls**
- Users set minimum acceptable outputs
- Deadline parameters prevent stale transactions
- Protection against sandwich attacks and front-running

**Emergency Mechanisms**
- Owner can pause all deposits/withdrawals
- Strategy whitelist prevents unauthorized integrations
- Emergency withdrawal from strategies
- Multi-sig ready (not yet implemented)

**Access Control**
- Owner-only functions for critical operations
- Strategy manager controls allocation
- Governance contract ready for DAO transition

### What's NOT Implemented Yet

**Multi-Signature Admin**
Currently using a single deployer address. Before mainnet:
- Set up 3-of-5 or 4-of-7 multi-sig
- Timelock (24-48h) on critical changes
- Multiple trusted parties as signers

**Rate Limiting**
No limits on deposit/withdrawal frequency. Could add:
- Cooldown periods between operations
- Maximum transaction sizes
- Daily withdrawal limits

**Circuit Breakers**
Basic pause mechanism exists but could be enhanced:
- Automatic pause on abnormal conditions
- Health monitoring for all strategies
- Automatic emergency withdrawals

---

## Threat Model

### Potential Attack Vectors

**Smart Contract Bugs**
- Risk: Code vulnerabilities could drain funds
- Mitigation: Comprehensive testing, security audit before mainnet
- Status: Pre-audit, use at own risk

**Economic Attacks**
- Risk: Flash loan attacks, price manipulation
- Mitigation: First depositor protection, slippage controls, deadlines
- Status: Basic protections implemented

**Admin Key Compromise**
- Risk: If deployer key is compromised, attacker controls contracts
- Mitigation: Multi-sig before mainnet, timelock on changes
- Status: Single key (testnet only - will upgrade)

**Strategy Protocol Risks**
- Risk: Integrated protocol gets hacked, SNP funds affected
- Mitigation: Strategy diversification, health monitoring, emergency withdrawal
- Status: Framework in place, needs real monitoring

**Front-Running**
- Risk: Bots see pending transactions and front-run for profit
- Mitigation: Slippage protection, deadline parameters
- Status: User-controlled protections implemented

---

## Security Roadmap

### Before Mainnet (Required)

**Week 1-4: Audit Preparation**
- [ ] Complete internal security review
- [ ] Document all security assumptions
- [ ] Create comprehensive attack scenario tests
- [ ] Get quotes from 3+ audit firms

**Week 5-10: Professional Audit**
- [ ] Select audit firm (CertiK, Trail of Bits, or similar)
- [ ] Complete full smart contract audit
- [ ] Fix all critical and high severity issues
- [ ] Reaudit any major changes

**Week 11-12: Launch Preparation**
- [ ] Set up multi-sig wallet (3-of-5 minimum)
- [ ] Implement timelock on critical functions
- [ ] Deploy monitoring dashboard
- [ ] Create incident response plan
- [ ] Launch bug bounty program

### After Mainnet

**Month 1-3: Monitoring**
- Real-time transaction monitoring
- Health checks on all strategies
- Daily security reviews
- Weekly status reports

**Month 4-6: Hardening**
- Implement rate limiting if needed
- Add circuit breakers based on learnings
- Expand multi-sig to 4-of-7 or higher
- Increase timelock delays

---

## Bug Bounty Program

**Status**: Not yet launched (will launch before mainnet)

**Planned Scope**:
- All SNP smart contracts
- Frontend wallet integration
- Infrastructure and APIs

**Planned Rewards**:
- Critical: Up to $50,000
- High: Up to $10,000
- Medium: Up to $2,500
- Low: Up to $500

Will be hosted on Immunefi or similar platform.

---

## Security Best Practices for Users

### When SNP Launches on Mainnet

**Start Small**
- Don't deposit your life savings on day one
- Test with amounts you're comfortable losing
- Wait for others to test first if you're risk-averse

**Understand the Risks**
- Smart contract risk (code bugs)
- Strategy risk (integrated protocols)
- Market risk (price volatility)
- Admin key risk (until fully decentralized)

**Monitor Your Positions**
- Check your vault balance regularly
- Watch for any unusual activity
- Join the Discord for announcements
- Enable notifications if available

**Use Hardware Wallets**
- Ledger or similar for significant amounts
- Don't use browser extension wallets for large sums
- Double-check transaction details before signing

---

## Incident Response Plan

### If a Security Issue is Discovered

**Hour 1: Assessment**
- Confirm the issue is real
- Assess severity and impact
- Notify core team

**Hour 2-4: Containment**
- Pause affected contracts if necessary
- Emergency withdraw from affected strategies
- Communicate with users via Twitter/Discord

**Hour 4-24: Resolution**
- Deploy fix if possible
- Work with security researchers
- Coordinate with integrated protocols if needed

**Day 2+: Recovery**
- Gradually resume operations
- Post-mortem analysis
- Implement additional safeguards
- Compensate affected users if appropriate

---

## Audit Status

**Current**: Not audited
**Planned**: Q1 2026
**Firms Considering**: CertiK, Trail of Bits, ConsenSys Diligence, Halborn

Will update this document with audit results when completed.

---

## Contact

**Security Issues**: mattglory14@gmail.com
**General Questions**: Discord (geoglory) or Twitter (@mattglory_)
**Response Time**: <48 hours for critical issues

---

## Acknowledgments

Thanks to anyone who responsibly discloses security issues. You're making SNP safer for everyone.

---

*This security policy will be updated as the project matures and new threats are identified.*

**Last Updated**: January 12, 2026
