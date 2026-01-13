# SNP Protocol - Code4STX Submission

## About This Submission

**Submission Date**: January 12, 2026
**Project Name**: SNP (Stacks Nexus Protocol)
**What It Is**: Bitcoin's first automated yield aggregator
**Developer**: Matt Glory (@mattglory_)
**Code**: https://github.com/mattglory/snp-mvp
**Branch**: code4stx-submission

---

## What I've Built

I've spent the last few months building SNP - an automated yield aggregator for the Stacks Bitcoin L2. Think of it as a "set it and forget it" solution for anyone who wants to earn yield across multiple DeFi protocols without the hassle of managing everything manually.

### The Core: 17 Smart Contracts

**Three Vaults** (each with different risk levels):
- `vault-stx-v2.clar` - Balanced approach (308 lines)
- `vault-conservative.clar` - Low risk, steady returns (299 lines)
- `vault-growth.clar` - Higher risk, higher potential (299 lines)

**Management Layer** (2 contracts):
- `strategy-manager-v2.clar` - The brain that coordinates everything (450 lines)
- `governance.clar` - Multi-sig governance system (200 lines)

**Strategy Integrations** (12 protocols):
I've integrated with pretty much every major DeFi protocol on Stacks - ALEX, Arkadiko, Bitflow, Granite, Hermetica, sBTC, stablecoin pools, StackingDAO, StackSwap, native STX stacking, Velar, and Zest. That's 3,800+ lines of production Clarity code.

---

## Does It Actually Work?

Yes. Everything compiles cleanly:

```bash
$ clarinet check
✔ 17 contracts checked
! 73 warnings (just standard Clarity patterns, nothing critical)
x 0 errors
```

I've written 111 tests covering deposit/withdrawal flows, fee calculations, emergency controls, multi-user scenarios, and all the edge cases I could think of. They're passing at 84% (the rest are intentionally skipped stress tests).

The contracts are live on testnet right now. You can see them deployed and verified on the Stacks Explorer.

---

## The Frontend

I've built a React + TypeScript interface with:
- Vault selector showing all three risk profiles
- Real-time APY displays
- Portfolio dashboard
- Allocation visualizations
- Bitcoin-themed design

It's functional, though the wallet integration still needs work.

---

## Security

This was a big focus for me. I've implemented:

**First Depositor Protection** - Requires a minimum 1000 STX first deposit and mints dead shares to prevent share manipulation attacks. This is the same pattern used by leading protocols.

**Slippage & Deadline Controls** - Users set their own slippage tolerance and transaction deadlines to protect against front-running.

**Emergency Systems** - If something goes wrong, there's a pause mechanism, emergency withdrawal from strategies, and a strategy whitelist.

**Fair Accounting** - The vault uses an ERC-4626-inspired share system that ensures everyone gets their fair share of the yield.

---

## Why This Matters

### The Market Gap

Stacks currently has $161.5M in TVL, but there are exactly zero automated yield aggregators. Everyone has to manually manage their positions across different protocols, rebalance allocations, harvest rewards, and handle all the complexity themselves.

SNP changes that. Deposit once, choose your risk profile, and the protocol handles everything else.

### The Timing

sBTC just launched in November 2025. This means Bitcoin liquidity is finally flowing into Stacks DeFi. SNP is positioned to catch this wave as the first automated aggregator, with a 3-6 month window before competitors show up.

### The Economics

Most yield aggregators charge 15-20% performance fees. SNP charges 8% - competitive with the best protocols while still sustainable for long-term development.

---

## What Happens Next

**If I get Code4STX funding:**

Weeks 1-2: Record a proper demo video, gather community feedback, launch a bug bounty

Months 1-3: Get a professional security audit (already getting quotes), deploy to mainnet with a careful TVL ramp-up, start building the community

Months 3-6: Launch governance token, transition to DAO, add more vault types

Months 6-12: Explore cross-chain opportunities, add institutional features, expand partnerships

**If I don't:**

I'll still move forward. I've already put months into this and believe in the vision. It'll just take longer without funding support.

---

## Get In Touch

I'm Matt Glory, based in Birmingham, UK. I've been deep in Stacks development for the past 4+ months, went through the LearnWeb3 Stacks Developer Degree program, and have been working on trading bots for a couple years before this.

- **Twitter**: @mattglory_
- **Discord**: geoglory
- **GitHub**: @mattglory
- **Email**: mattglory14@gmail.com

---

## Thanks

To the Stacks Foundation for running Code4STX, to Hiro for building incredible dev tools, to the Stacks community for being welcoming and supportive, and to whoever's reviewing this - I appreciate you taking the time.

---

## Submission Checklist

- [x] Contracts compile (100%)
- [x] Tests passing (111 tests, 84%)
- [x] Frontend built (wallet integration in progress)
- [x] Security features implemented
- [x] Documentation complete
- [x] Code commented
- [x] GitHub public
- [ ] Demo video (doing this next)
- [ ] Submission form filled

---

## Why I Think SNP Deserves Consideration

Look, I'm not going to oversell this. Here's what I've got:

**First-Mover**: I'm the first one building an automated yield aggregator on Stacks. The market gap is real - $161.5M TVL and nobody's solving this problem yet.

**Actually Built**: This isn't vaporware or a whitepaper. The contracts work, they're tested, they're on testnet. You can interact with them right now.

**Security Matters**: I've studied how the best protocols handle security and implemented those patterns. First depositor protection, slippage controls, emergency systems - it's all there.

**User-Centric**: Three risk profiles mean users can choose their comfort level instead of one-size-fits-all.

**Production Quality**: 3,800+ lines of code, 111 tests, clean compilation. I'm treating this like production software because that's what it needs to be.

**Ecosystem Value**: If SNP succeeds, it makes Stacks DeFi more accessible to everyone. That benefits the entire ecosystem.

---

This project represents months of late nights, learning Clarity, figuring out DeFi patterns, building and rebuilding, and testing everything I could think of. It's not perfect, but it's solid, it works, and it solves a real problem.

Thanks for considering it.

*Built with Bitcoin on Stacks | Code4STX Submission | January 2026*
