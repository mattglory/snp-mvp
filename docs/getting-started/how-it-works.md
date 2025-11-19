# How SNP Works

A technical deep dive into SNP's architecture and automation mechanisms.

---

## 🏗️ System Architecture

SNP uses a **hub-and-spoke model** inspired by Yearn Finance V3:

```
                    ┌─────────────────┐
                    │   SNP Vaults    │
                    │  (Allocators)   │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
    │  Strategy 1  │  │ Strategy 2  │  │ Strategy N │
    │    (ALEX)    │  │   (Zest)    │  │  (sBTC)    │
    └──────────────┘  └─────────────┘  └────────────┘
```

### Core Components

1. **Vault Contracts** - User-facing deposit/withdrawal interface
2. **Strategy Contracts** - Individual yield generation strategies
3. **Debt Allocator** - Manages capital distribution
4. **Fee Distributor** - Handles performance fees
5. **Oracle System** - Price feeds and APY tracking
6. **Emergency Controller** - Pause/resume functionality

---

## 📊 Vault System

### Three Vault Types

**Conservative Vault (Low Risk)**
```clarity
Target APY: 8-10%
Risk Score: 2/5
Allocation:
├─ 50% STX Stacking (BTC rewards)
├─ 30% Stable lending (Zest/Arkadiko)
└─ 20% Blue-chip LP (ALEX STX-USDA)
```

**Balanced Vault (Medium Risk)**
```clarity
Target APY: 12-15%
Risk Score: 3/5
Allocation:
├─ 25% STX Stacking
├─ 25% ALEX DEX LPs
├─ 20% Zest lending
├─ 15% Arkadiko vaults
└─ 15% Velar pools
```

**Growth Vault (Higher Risk)**
```clarity
Target APY: 18-25%
Risk Score: 4/5
Allocation:
├─ 35% High-yield LPs (ALEX/Velar)
├─ 25% Leveraged strategies
├─ 20% New protocol yields
└─ 20% sBTC strategies
```

### Share Tokenization

When you deposit, you receive **vault tokens** representing your share:

```clarity
;; Deposit 1000 STX into Balanced Vault
(deposit 1000) → Receive 950 snSTX-BAL tokens

;; Token represents your proportional ownership
Your share = (your tokens / total tokens) × total vault assets
```

**Example:**
```
Vault Total Assets: 100,000 STX
Your snSTX-BAL: 950 tokens
Total snSTX-BAL: 100,000 tokens

Your ownership: (950 / 100,000) × 100,000 = 950 STX

After 1 month (vault grows 10%):
Vault Total Assets: 110,000 STX
Your share: (950 / 100,000) × 110,000 = 1,045 STX

Your profit: 45 STX (4.7% monthly return)
```

---

## 🎯 Strategy System

### Strategy Lifecycle

```
1. STRATEGY CREATION
   └─> Developer builds strategy contract
       └─> Implements standard interface
           └─> Passes security review

2. STRATEGY ACTIVATION
   └─> Added to vault's strategy list
       └─> Assigned target allocation (e.g., 15%)
           └─> Receives initial deployment

3. ACTIVE MANAGEMENT
   └─> Regular harvests (compound rewards)
       └─> Dynamic rebalancing
           └─> Performance monitoring

4. STRATEGY RETIREMENT (if needed)
   └─> Gradual withdrawal of funds
       └─> Reallocation to other strategies
           └─> Strategy deactivation
```

### Standard Strategy Interface

Every strategy must implement:

```clarity
(define-trait strategy-trait
  (
    ;; Deploy capital to yield source
    (deploy-funds (uint) (response uint uint))
    
    ;; Free capital from yield source
    (free-funds (uint) (response uint uint))
    
    ;; Harvest rewards and report gains
    (harvest () (response uint uint))
    
    ;; Get total value managed
    (get-total-assets () (response uint uint))
    
    ;; Get strategy metadata
    (get-strategy-name () (response (string-ascii 50) uint))
    (get-risk-score () (response uint uint))
  )
)
```

### Example: ALEX LP Strategy

```clarity
;; ALEX STX-USDA Liquidity Pool Strategy

(define-public (deploy-funds (amount uint))
  (begin
    ;; 1. Split amount 50/50 for STX-USDA pair
    (let ((stx-amount (/ amount u2))
          (usda-amount (get-usda-equivalent (/ amount u2))))
      
      ;; 2. Add liquidity to ALEX pool
      (try! (contract-call? .alex-router add-liquidity
              .token-wstx
              .token-usda
              stx-amount
              usda-amount
              u1  ;; min-stx
              u1  ;; min-usda
              ))
      
      ;; 3. Stake LP tokens in farm
      (try! (contract-call? .alex-farm stake
              .alex-stx-usda-pool
              (get-lp-balance)))
      
      (ok amount)
    )
  )
)

(define-public (harvest)
  (begin
    ;; 1. Claim ALEX rewards from farm
    (try! (contract-call? .alex-farm harvest .alex-stx-usda-pool))
    
    ;; 2. Swap ALEX rewards to STX
    (let ((alex-rewards (get-alex-balance)))
      (try! (contract-call? .alex-router swap
              .token-alex
              .token-wstx
              alex-rewards
              u0))  ;; min-out
    )
    
    ;; 3. Calculate and report gains
    (let ((new-value (get-total-assets))
          (old-value (var-get last-value))
          (gains (- new-value old-value)))
      
      ;; 4. Update tracking
      (var-set last-value new-value)
      (var-set last-harvest block-height)
      
      (ok gains)
    )
  )
)
```

---

## ⚖️ Debt Allocation

### How Capital Gets Distributed

The **Debt Allocator** manages how vault assets are split across strategies:

```clarity
;; Example: Balanced Vault with 100,000 STX

Strategy Allocations:
├─ ALEX LP:        25% = 25,000 STX (deployed)
├─ Zest Lending:   20% = 20,000 STX (deployed)
├─ STX Stacking:   25% = 25,000 STX (deployed)
├─ Velar Pools:    15% = 15,000 STX (deployed)
├─ Arkadiko:       10% = 10,000 STX (deployed)
└─ Reserve (idle):  5% = 5,000 STX (for quick withdrawals)
```

### Rebalancing Logic

Rebalancing happens when:

1. **Strategy performance changes** - High performers get more allocation
2. **New deposits arrive** - Capital distributed per targets
3. **Withdrawals needed** - Free from lowest-performing strategies
4. **Manual trigger** - Governance can force rebalance

```clarity
(define-public (rebalance)
  (let ((total-assets (get-vault-total-assets)))
    
    ;; For each strategy
    (map rebalance-strategy (var-get active-strategies))
    
    ;; Calculate actual vs target debt
    ;; Increase debt if below target
    ;; Decrease debt if above target
  )
)

;; Example rebalance calculation
Strategy: ALEX LP
├─ Current debt: 20,000 STX (20%)
├─ Target allocation: 25% (25,000 STX)
├─ Deficit: 5,000 STX
└─ Action: Deploy additional 5,000 STX
```

---

## 💰 Fee Mechanics

### Performance Fees (1.5%)

Charged only on **realized profits** during harvest:

```clarity
;; Harvest cycle example
Strategy reports gains: 1,000 STX
Performance fee (1.5%): 15 STX

Fee distribution:
├─ Protocol Treasury: 5 STX (0.5%)
├─ Strategy Creator: 3 STX (0.3%)
└─ DAO Treasury: 7 STX (0.7%)

User receives: 985 STX (98.5% of gains)
```

### No Management Fees

Unlike traditional funds, SNP charges **0% management fee**:

```
Annual comparison on 10,000 STX:

SNP:
- Management fee: $0
- Performance fee: Only on profits

Yearn Finance:
- Management fee: $200 (2% annually)
- Performance fee: 20% of profits
```

---

## 🔄 Harvest & Compound Cycle

### Automatic Compounding

```
Every 24-72 hours (depending on gas economics):

1. HARVEST REWARDS
   ├─> Each strategy harvests yield
   ├─> Rewards swapped to base asset (STX)
   └─> Gains calculated and reported

2. CHARGE FEES
   ├─> 1.5% performance fee deducted
   └─> Distributed to protocol/creators/DAO

3. COMPOUND
   ├─> Remaining 98.5% of gains
   ├─> Added back to vault assets
   └─> Automatically redeployed

4. UPDATE METRICS
   ├─> Share price increases
   ├─> APY recalculated
   └─> Users see updated balances
```

### Share Price Growth

```clarity
;; As vault compounds, share price increases

Day 1:  1 snSTX = 1.00 STX
Day 30: 1 snSTX = 1.012 STX (1.2% growth)
Day 60: 1 snSTX = 1.025 STX (2.5% growth)
Day 90: 1 snSTX = 1.039 STX (3.9% growth)

Your 1000 snSTX value:
Day 1:  1,000 STX
Day 90: 1,039 STX (+39 STX profit)
```

---

## 🚨 Emergency Controls

### Circuit Breakers

SNP has multiple safety mechanisms:

**1. Vault Pause**
```clarity
;; Emergency pause stops all deposits/withdraws
(define-public (pause-vault)
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_ADMIN)
    (var-set vault-paused true)
    (ok true)
  )
)
```

**2. Strategy Isolation**
```clarity
;; Individual strategy can be isolated
(define-public (emergency-exit-strategy (strategy principal))
  (begin
    ;; 1. Stop new deployments
    (map-set strategies strategy {active: false})
    
    ;; 2. Withdraw all funds
    (try! (contract-call? strategy free-all-funds))
    
    ;; 3. Mark as emergency exited
    (ok true)
  )
)
```

**3. Withdrawal Queue**
```clarity
;; If mass withdrawals occur, implement queue
(define-public (queue-withdrawal (amount uint))
  (if (> (get-withdrawal-pressure) THRESHOLD)
      (add-to-withdrawal-queue tx-sender amount)
      (execute-immediate-withdrawal tx-sender amount)
  )
)
```

---

## 📊 APY Calculation

### Real-Time APY Tracking

```clarity
;; APY calculated from recent performance

(define-read-only (calculate-vault-apy)
  (let (
    (current-share-price (get-share-price))
    (price-7d-ago (get-historical-price u7))
    (price-30d-ago (get-historical-price u30))
    )
    
    ;; Calculate 7-day APY
    (let ((weekly-return (/ (* (- current-share-price price-7d-ago) u52) price-7d-ago)))
      
      ;; Calculate 30-day APY
      (let ((monthly-return (/ (* (- current-share-price price-30d-ago) u12) price-30d-ago)))
        
        ;; Return weighted average
        {
          apy-7d: weekly-return,
          apy-30d: monthly-return,
          apy-displayed: (/ (+ (* weekly-return u3) monthly-return) u4)  ;; 75% weight on 7d
        }
      )
    )
  )
)
```

### APY Display
```
Balanced Vault APY: 12.7%

Breakdown:
├─ Base yields: 14.2%
│  ├─ ALEX LP: 18% (25% allocation)
│  ├─ STX Stacking: 9% (25% allocation)
│  ├─ Zest: 12% (20% allocation)
│  └─ Others: 13% avg (30% allocation)
│
├─ Compounding boost: +1.8%
└─ Net after fees: 12.7%
   (14.2% × 1.018 compound - 1.5% perf fee)
```

---

## 🔐 Security Model

### Multi-Layer Protection

```
Layer 1: Contract Security
├─> Comprehensive test coverage (100%)
├─> Emergency pause functionality
└─> Role-based access control

Layer 2: Strategy Isolation
├─> Each strategy is separate contract
├─> Strategy failure doesn't affect others
└─> Emergency exit per strategy

Layer 3: Vault Diversification
├─> No single strategy > 35% allocation
├─> Risk-adjusted position sizing
└─> Protocol diversification

Layer 4: Oracle Safety
├─> Multiple price feed sources
├─> Deviation thresholds
└─> Fallback mechanisms

Layer 5: Governance
├─> Time-locked upgrades
├─> Multi-sig admin controls
└─> Community oversight
```

---

## 🎮 User Flow Example

### Complete Deposit → Earn → Withdraw Cycle

```
1. USER DEPOSITS
   Alice deposits 5,000 STX to Balanced Vault
   ↓
2. MINT SHARES
   Alice receives 4,761 snSTX-BAL tokens
   (Current price: 1 snSTX = 1.05 STX)
   ↓
3. DEPLOY CAPITAL
   Vault allocates across strategies:
   - 1,250 STX → ALEX LP (25%)
   - 1,250 STX → STX Stacking (25%)
   - 1,000 STX → Zest (20%)
   - 750 STX → Velar (15%)
   - 500 STX → Arkadiko (10%)
   - 250 STX → Reserve (5%)
   ↓
4. EARN YIELDS (30 days)
   Strategies generate returns:
   - ALEX: +22 STX
   - Stacking: +9 STX BTC value
   - Zest: +10 STX
   - Velar: +12 STX
   - Arkadiko: +5 STX
   Total gains: +58 STX (1.16%)
   ↓
5. HARVEST & COMPOUND
   - Performance fee: 0.87 STX (1.5%)
   - Alice's share: 57.13 STX (98.5%)
   - New total: 5,057.13 STX
   - Share price: 1.062 STX
   ↓
6. ALICE WITHDRAWS (optional)
   Burns 4,761 snSTX tokens
   Receives: 4,761 × 1.062 = 5,056 STX
   Profit: 56 STX (1.12% in 30 days)
   Annual equivalent: ~13.4% APY
```

---

## 🚀 Advanced Features (Roadmap)

### Coming Soon

**1. Flash Loan Optimization**
```
Use Arkadiko flash loans to:
- Instant rebalancing with no up-front capital
- Leveraged yield strategies
- Gas-free compounding
```

**2. Cross-Chain Yields**
```
Deploy across Bitcoin L2s:
- 40% Stacks
- 30% Core DAO
- 30% Rootstock
= Maximum diversification
```

**3. Strategy Marketplace**
```
Community-built strategies:
- Anyone can submit strategy
- Governance approval
- Revenue sharing (33% to creator)
```

**4. AI-Powered Allocation**
```
Machine learning for:
- Optimal rebalancing timing
- Risk-adjusted position sizing
- Market condition adaptation
```

---

## 📚 Next Steps

**For Users:**
- [Quick Start Guide](./quick-start.md) - Start earning in 5 minutes
- [Understanding APY](../user-guide/understanding-apy.md) - Know your returns
- [Risk Management](../user-guide/risk-management.md) - Protect your capital

**For Developers:**
- [Architecture Deep Dive](../developer-guide/overview.md)
- [Building Strategies](../strategy-development/creating-strategies.md)
- [Integration Guide](../integration-guide/protocol-integration.md)

**For Partners:**
- [White-Label Vaults](../integration-guide/white-label.md)
- [Protocol Integration](../integration-guide/protocol-integration.md)
- [Revenue Sharing](../strategy-development/revenue-sharing.md)

---

**Questions?** Join our [Discord](https://discord.gg/snp) or check the [FAQ](../faq.md).
