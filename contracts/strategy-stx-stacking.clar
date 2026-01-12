;; Strategy: STX Stacking (Proof of Transfer)
;; Target: 8-12% APY through Bitcoin rewards
;; Risk: Low (network-level staking, no smart contract risk)

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_AMOUNT (err u402))
(define-constant ERR_STRATEGY_PAUSED (err u403))
(define-constant ERR_INSUFFICIENT_BALANCE (err u406))
(define-constant ERR_STACKING_FAILED (err u409))
(define-constant ERR_NOT_STACKING (err u410))
(define-constant ERR_CYCLE_NOT_COMPLETE (err u411))

;; Minimum STX to stack (90,000 STX)
(define-constant MIN_STACK_AMOUNT u90000000000) ;; 90k STX in micro-STX

;; Strategy state
(define-data-var strategy-name (string-ascii 64) "STX Stacking for BTC")
(define-data-var is-paused bool false)
(define-data-var total-assets uint u0)
(define-data-var vault-contract (optional principal) none)
(define-data-var strategy-manager (optional principal) none)

;; Stacking configuration
(define-data-var stacking-pool (optional principal) none)
(define-data-var btc-reward-address (optional (buff 128)) none)
(define-data-var current-cycle uint u0)
(define-data-var stacked-amount uint u0)
(define-data-var unlock-height uint u0)

;; Performance tracking
(define-data-var total-btc-earned uint u0)
(define-data-var cycles-stacked uint u0)

;; ========================================
;; ADMIN FUNCTIONS
;; ========================================

(define-public (set-vault (new-vault principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set vault-contract (some new-vault))
    (ok true)))

(define-public (set-strategy-manager (new-manager principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set strategy-manager (some new-manager))
    (ok true)))

(define-public (set-btc-reward-address (btc-addr (buff 128)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set btc-reward-address (some btc-addr))
    (ok true)))

(define-public (set-stacking-pool (pool principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set stacking-pool (some pool))
    (ok true)))

(define-public (pause-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set is-paused true)
    (ok true)))

(define-public (unpause-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set is-paused false)
    (ok true)))

;; ========================================
;; CORE STRATEGY FUNCTIONS
;; ========================================

;; Deposit STX and start stacking
(define-public (deposit (amount uint) (num-cycles uint))
  (let ((caller tx-sender))
    (asserts! (not (var-get is-paused)) ERR_STRATEGY_PAUSED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-authorized-caller caller) ERR_UNAUTHORIZED)
    
    ;; Transfer STX from vault
    (try! (stx-transfer? amount caller (as-contract tx-sender)))
    
    ;; Check if we have minimum to stack
    (let ((new-total (+ (var-get stacked-amount) amount)))
      (if (>= new-total MIN_STACK_AMOUNT)
        ;; Stack the STX (simulated for local testing)
        (begin
          ;; TODO: Replace with actual PoX stacking on mainnet
          ;; (try! (as-contract (contract-call? .pox-4 stack-stx new-total (var-get pox-addr) (var-get start-burn-ht) num-cycles)))
          (var-set stacked-amount new-total)
          (var-set total-assets (+ (var-get total-assets) amount))
          (var-set cycles-stacked (+ (var-get cycles-stacked) num-cycles))
          (ok amount))
        ;; Hold STX until minimum reached
        (begin
          (var-set total-assets (+ (var-get total-assets) amount))
          (ok amount))))))

;; Withdraw STX (only possible after unlock)
(define-public (withdraw (amount uint))
  (let ((caller tx-sender))
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-authorized-caller caller) ERR_UNAUTHORIZED)
    (asserts! (<= amount (var-get total-assets)) ERR_INSUFFICIENT_BALANCE)
    
    ;; Check if STX is unlocked
    (asserts! (or 
      (is-eq (var-get stacked-amount) u0)
      (>= burn-block-height (var-get unlock-height))) 
      ERR_CYCLE_NOT_COMPLETE)
    
    ;; Transfer STX to caller
    (try! (as-contract (stx-transfer? amount tx-sender caller)))
    
    ;; Update state
    (var-set total-assets (- (var-get total-assets) amount))
    (if (> (var-get stacked-amount) u0)
      (var-set stacked-amount (- (var-get stacked-amount) amount))
      true)
    
    (ok amount)))

;; Claim BTC rewards (tracked off-chain via BTC address)
(define-public (record-btc-rewards (btc-amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set total-btc-earned (+ (var-get total-btc-earned) btc-amount))
    (ok true)))

;; ========================================
;; INTERNAL HELPER FUNCTIONS
;; ========================================

(define-private (is-authorized-caller (caller principal))
  (or 
    (is-eq caller CONTRACT_OWNER)
    (is-eq (some caller) (var-get vault-contract))
    (is-eq (some caller) (var-get strategy-manager))))

(define-private (stack-stx (amount uint) (num-cycles uint))
  ;; TODO: Implement actual PoX stacking
  ;; (contract-call? .pox-4 stack-stx amount btc-addr lock-period)
  ;; For now, simulate stacking
  (begin
    (var-set current-cycle (+ burn-block-height u1))
    (var-set unlock-height (+ burn-block-height (* num-cycles u2100))) ;; ~2100 blocks per cycle
    (ok true)))

;; ========================================
;; READ-ONLY FUNCTIONS
;; ========================================

(define-read-only (get-strategy-name)
  (ok (var-get strategy-name)))

(define-read-only (get-total-assets)
  (ok (var-get total-assets)))

(define-read-only (is-strategy-paused)
  (ok (var-get is-paused)))

(define-read-only (get-strategy-config)
  (ok {
    name: (var-get strategy-name),
    total-assets: (var-get total-assets),
    is-paused: (var-get is-paused),
    vault: (var-get vault-contract),
    manager: (var-get strategy-manager),
    stacked-amount: (var-get stacked-amount),
    unlock-height: (var-get unlock-height),
    cycles-stacked: (var-get cycles-stacked),
    total-btc-earned: (var-get total-btc-earned)
  }))

(define-read-only (get-stacking-info)
  (ok {
    stacked: (var-get stacked-amount),
    unlock-at: (var-get unlock-height),
    current-cycle: (var-get current-cycle),
    is-locked: (< burn-block-height (var-get unlock-height)),
    btc-address: (var-get btc-reward-address),
    pool: (var-get stacking-pool)
  }))

(define-read-only (get-apy-estimate)
  ;; Target: 8-12% APY from BTC rewards
  (ok u1000)) ;; 10% in basis points

(define-read-only (get-health-status)
  (ok {
    is-healthy: true,
    is-stacking: (> (var-get stacked-amount) u0),
    can-withdraw: (>= burn-block-height (var-get unlock-height))
  }))
