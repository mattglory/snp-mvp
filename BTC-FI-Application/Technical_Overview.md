# SNP Technical Overview

## Architecture

I built SNP using a hub-and-spoke design for scalable multi-protocol yield aggregation.

```
User Wallet
    ↓
Vault Contracts (3 hubs)
    ↓
Strategy Manager (control)
    ↓
Strategy Contracts (12 spokes)
    ↓
DeFi Protocols (ALEX, Zest, Arkadiko, etc.)
```

---

## Smart Contracts

**Total: 17 contracts, 3,800+ lines of Clarity code**

### Core Vaults (3)

| Contract | Token | Risk | APY | Lines |
|----------|-------|------|-----|-------|
| vault-stx-v2.clar | snSTX | Medium | 12-16% | 308 |
| vault-conservative.clar | snSTX-CONS | Low | 8-10% | 299 |
| vault-growth.clar | snSTX-GRTH | High | 18-25% | 299 |

### Management (2)

- `strategy-manager-v2.clar` - Orchestration (450 lines)
- `governance.clar` - Protocol governance (200 lines)

### Strategies (12)

ALEX, Zest, Arkadiko, Bitflow, Granite, Hermetica, sBTC, Stablecoin Pools, StackingDAO, StackSwap, STX Stacking, Velar

---

## Technology Stack

**Smart Contracts:**
- Clarity (Stacks Bitcoin L2)
- Clarinet CLI for development
- Vitest + @hirosystems/clarinet-sdk for testing

**Frontend:**
- React 18 + TypeScript
- TailwindCSS for styling
- Vite for builds
- Recharts for data visualization

**Blockchain Integration:**
- @stacks/connect (wallet integration)
- @stacks/transactions (contract calls)

---

## Security Features

### 1. First Depositor Protection
Minimum 1,000 STX first deposit + 1,000 dead shares to burn address prevents share price manipulation. Based on EIP-4626 security pattern.

### 2. Slippage Protection
User-defined minimum outputs and deadlines prevent front-running and sandwich attacks.

### 3. Emergency Controls
- Pause mechanism for critical issues
- Emergency withdrawal from strategies
- Strategy whitelist system

### 4. Access Control
Role-based permissions with no hidden admin functions.

---

## Testing

**86 comprehensive test cases**

| Test Suite | Tests | Focus |
|-------------|-------|-------|
| setup.test.ts | 6 | Environment |
| vault-stx-v2.test.ts | 12 | Balanced vault |
| vault-conservative.test.ts | 33 | Conservative vault |
| vault-growth.test.ts | 35 | Growth vault |

**Results:**
- ✅ 100% compilation success
- ✅ 100% test pass rate
- ✅ 0 errors

---

## Key Design Patterns

**1. Vault Token Standard**
Users receive receipt tokens (snSTX, snSTX-CONS, snSTX-GRTH) representing their share. Share price increases as yields accumulate.

**2. Strategy Isolation**
Each strategy contract is independent. One strategy failure doesn't affect others or the vault system.

**3. Modular Integration**
New protocols can be added without modifying core vaults. Just deploy new strategy and whitelist.

**4. Cross-Chain Ready**
Architecture enables easy expansion to additional chains with minimal changes.

---

## Data Flow

**Deposit:**
1. User approves STX
2. Vault calculates shares
3. Mints receipt tokens
4. Allocates funds to strategies
5. Strategies deploy to protocols

**Yield:**
1. Protocols generate yields
2. Share price increases automatically
3. Users see increased balance

**Withdrawal:**
1. User requests withdrawal
2. Vault calculates STX owed
3. Retrieves funds from strategies
4. Deducts 8% fee from gains
5. Transfers STX, burns receipt tokens

---

## Performance

| Metric | Value |
|--------|-------|
| Deposit gas | ~100K units |
| Withdrawal gas | ~150K units |
| Rebalance frequency | Daily |
| Minimum deposit | 1,000 STX (first), 100 STX (after) |
| Max TVL | Unlimited |

---

## Repository Structure

```
snp-mvp/
├── contracts/         # 17 smart contracts
├── tests/             # 86 test cases  
├── frontend/          # React app
├── docs/              # Documentation
└── README.md          # Overview
```

---

## Getting Started

```bash
git clone https://github.com/mattglory/snp-mvp
cd snp-mvp
clarinet check        # Verify compilation
npm install
npm test              # Run tests
```

---

## Planned Improvements

**Q1-Q2 2026:**
- Core chain migration
- Cross-chain bridge
- Gas optimization
- Real-time yield tracking

**Q3-Q4 2026:**
- Governance upgrades
- Token distribution
- Advanced strategy selection
- AI-powered optimization (experimental)

**2026+:**
- Multi-chain atomic rebalancing
- Layer 3 integration
- Institutional APIs
- White-label deployment

---

*Full code review: https://github.com/mattglory/snp-mvp*
