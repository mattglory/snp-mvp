;; vault-stx-v2.clar
;; Stacks Nexus Protocol - Core STX Vault (SECURITY HARDENED)
;; Holds user STX and routes to yield strategies
;;
;; Security improvements:
;; - First depositor attack protection via minimum deposit + dead shares
;; - Slippage protection on withdrawals
;; - Emergency withdrawal from strategies
;; - Deadline protection against stale transactions

;; Define strategy trait
(define-trait strategy-trait
  (
    (deposit (uint) (response uint uint))
    (withdraw (uint) (response uint uint))
    (harvest () (response uint uint))
  ))

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-ZERO-AMOUNT (err u102))
(define-constant ERR-STRATEGY-NOT-ACTIVE (err u103))
(define-constant ERR-PAUSED (err u104))
(define-constant ERR-STRATEGY-NOT-WHITELISTED (err u105))
(define-constant ERR-TRANSFER-FAILED (err u106))
(define-constant ERR-SLIPPAGE-EXCEEDED (err u107))
(define-constant ERR-DEADLINE-PASSED (err u108))
(define-constant ERR-MINIMUM-DEPOSIT (err u109))
(define-constant ERR-STRATEGY-CALL-FAILED (err u110))

;; Security constants
(define-constant MINIMUM-FIRST-DEPOSIT u1000000000) ;; 1000 STX in micro-STX
(define-constant DEAD-SHARES u1000) ;; Initial shares burned to prevent manipulation
(define-constant BURN-ADDRESS 'SP000000000000000000002Q6VF78) ;; Burn address

;; SIP-010 fungible token for vault shares
(define-fungible-token vault-shares)

;; Data vars
(define-data-var contract-owner principal tx-sender)
(define-data-var total-assets uint u0)
(define-data-var active-strategy (optional principal) none)
(define-data-var paused bool false)
(define-data-var performance-fee-bps uint u0) ;; Zero fees - fully self-custodial, no rent extraction
(define-data-var initialized bool false)

;; Maps
(define-map strategy-whitelist principal bool)
(define-map strategy-assets principal uint) ;; Track assets per strategy

;; Events
(define-map event-log uint {event: (string-ascii 20), amount: uint, user: principal})
(define-data-var event-nonce uint u0)

;; --- Admin Functions ---

(define-read-only (is-contract-owner)
  (is-eq tx-sender (var-get contract-owner)))

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (var-set contract-owner new-owner))))

(define-public (emergency-pause)
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (var-set paused true)
    (ok true)))

(define-public (resume)
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (var-set paused false)
    (ok true)))

(define-public (whitelist-strategy (strategy principal) (whitelisted bool))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (map-set strategy-whitelist strategy whitelisted))))

(define-public (set-active-strategy (strategy principal))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (asserts! (is-strategy-whitelisted strategy) ERR-STRATEGY-NOT-WHITELISTED)
    (ok (var-set active-strategy (some strategy)))))

;; Emergency: Pull funds back from strategy if it's broken
(define-public (emergency-withdraw-from-strategy (strategy <strategy-trait>) (amount uint))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (asserts! (var-get paused) ERR-NOT-AUTHORIZED) ;; Only when paused

    ;; Try to withdraw from strategy
    (let ((withdrawn-amount (unwrap! (contract-call? strategy withdraw amount) ERR-STRATEGY-CALL-FAILED)))
      ;; Update tracking
      (map-set strategy-assets (contract-of strategy)
        (- (default-to u0 (map-get? strategy-assets (contract-of strategy))) amount))
      (ok true))))

;; --- Core Vault Functions ---

(define-public (deposit (amount uint))
  (let (
    (sender tx-sender)
    (supply (ft-get-supply vault-shares))
    (shares (calculate-shares amount))
  )
    (asserts! (not (var-get paused)) ERR-PAUSED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    
    ;; First deposit protection: Enforce minimum and mint dead shares
    (if (is-eq supply u0)
      (begin
        (asserts! (>= amount MINIMUM-FIRST-DEPOSIT) ERR-MINIMUM-DEPOSIT)
        ;; Mint dead shares to burn address to prevent manipulation
        (try! (ft-mint? vault-shares DEAD-SHARES BURN-ADDRESS))
        (var-set initialized true))
      true)
    
    ;; Transfer STX from user to vault
    (try! (stx-transfer? amount sender (as-contract tx-sender)))
    
    ;; Mint vault shares to user
    (try! (ft-mint? vault-shares shares sender))
    
    ;; Update total assets
    (var-set total-assets (+ (var-get total-assets) amount))
    
    ;; Log event
    (log-event "deposit" amount sender)
    
    (ok shares)))

(define-public (withdraw (shares uint) (min-amount-out uint) (deadline uint))
  (let (
    (sender tx-sender)
    (assets (calculate-assets shares))
    (fee (calculate-fee assets))
    (assets-after-fee (- assets fee))
  )
    (asserts! (not (var-get paused)) ERR-PAUSED)
    (asserts! (> shares u0) ERR-ZERO-AMOUNT)
    (asserts! (>= (ft-get-balance vault-shares sender) shares) ERR-INSUFFICIENT-BALANCE)
    
    ;; Slippage protection: Ensure user gets at least min-amount-out
    (asserts! (>= assets-after-fee min-amount-out) ERR-SLIPPAGE-EXCEEDED)
    
    ;; Deadline protection: Prevent stale transactions
    (asserts! (<= burn-block-height deadline) ERR-DEADLINE-PASSED)
    
    ;; Burn vault shares
    (try! (ft-burn? vault-shares shares sender))
    
    ;; Transfer STX back to user (minus fee)
    (try! (as-contract (stx-transfer? assets-after-fee tx-sender sender)))
    
    ;; Transfer fee to contract owner
    (if (> fee u0)
      (try! (as-contract (stx-transfer? fee tx-sender (var-get contract-owner))))
      true)
    
    ;; Update total assets
    (var-set total-assets (- (var-get total-assets) assets))
    
    ;; Log event
    (log-event "withdraw" assets sender)
    
    (ok assets-after-fee)))

;; Preview function: Check how much you'll get before withdrawing
(define-read-only (preview-withdraw (shares uint))
  (let (
    (assets (calculate-assets shares))
    (fee (calculate-fee assets))
    (assets-after-fee (- assets fee))
  )
    (ok {
      gross-amount: assets,
      fee: fee,
      net-amount: assets-after-fee,
      current-block: burn-block-height
    })))

;; --- Strategy Integration ---

(define-public (allocate-to-strategy (strategy <strategy-trait>) (amount uint))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (asserts! (>= (get-vault-stx-balance) amount) ERR-INSUFFICIENT-BALANCE)

    ;; Transfer STX to strategy
    (let ((strategy-addr (contract-of strategy)))
      (try! (as-contract (stx-transfer? amount tx-sender strategy-addr)))

      ;; Call strategy deposit
      (try! (contract-call? strategy deposit amount))

      ;; Track allocation
      (map-set strategy-assets strategy-addr
        (+ (default-to u0 (map-get? strategy-assets strategy-addr)) amount))

      (ok true))))

(define-public (harvest-strategy (strategy <strategy-trait>))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)

    ;; Call strategy harvest - handle potential failures gracefully
    (let ((rewards (unwrap! (contract-call? strategy harvest) ERR-STRATEGY-CALL-FAILED)))
      (ok rewards))))

;; --- View Functions ---

(define-read-only (get-total-supply)
  (ok (ft-get-supply vault-shares)))

(define-read-only (get-balance (user principal))
  (ok (ft-get-balance vault-shares user)))

(define-read-only (get-total-assets)
  (ok (var-get total-assets)))

(define-read-only (get-vault-stx-balance)
  (stx-get-balance (as-contract tx-sender)))

(define-read-only (get-share-price)
  (let (
    (supply (ft-get-supply vault-shares))
    (assets (var-get total-assets))
  )
    (if (is-eq supply u0)
      u1000000 ;; 1:1 ratio at start (1 STX = 1 share, in micro-units)
      (/ (* assets u1000000) supply))))

(define-read-only (is-strategy-whitelisted (strategy principal))
  (default-to false (map-get? strategy-whitelist strategy)))

(define-read-only (get-active-strategy)
  (var-get active-strategy))

(define-read-only (is-paused)
  (var-get paused))

(define-read-only (is-initialized)
  (var-get initialized))

(define-read-only (get-strategy-allocation (strategy principal))
  (ok (default-to u0 (map-get? strategy-assets strategy))))

;; --- Helper Functions ---

(define-private (calculate-shares (amount uint))
  (let (
    (supply (ft-get-supply vault-shares))
    (assets (var-get total-assets))
  )
    (if (is-eq supply u0)
      amount ;; First deposit: 1:1 ratio
      ;; Prevent precision loss: (amount * supply) / assets
      ;; Note: Dead shares prevent first-depositor attack on this calculation
      (/ (* amount supply) assets))))

(define-private (calculate-assets (shares uint))
  (let (
    (supply (ft-get-supply vault-shares))
    (assets (var-get total-assets))
  )
    (if (is-eq supply u0)
      u0
      (/ (* shares assets) supply))))

(define-private (calculate-fee (amount uint))
  (/ (* amount (var-get performance-fee-bps)) u10000))

(define-private (log-event (event-type (string-ascii 20)) (amount uint) (user principal))
  (let (
    (nonce (var-get event-nonce))
  )
    (map-set event-log nonce {event: event-type, amount: amount, user: user})
    (var-set event-nonce (+ nonce u1))
    true))

;; --- SIP-010 Trait (partial) ---

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (try! (ft-transfer? vault-shares amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-read-only (get-name)
  (ok "Stacks Nexus Vault Shares"))

(define-read-only (get-symbol)
  (ok "snSTX"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-token-uri)
  (ok (some u"https://stacksnexus.io/vault/metadata")))

(define-read-only (get-balance-of (account principal))
  (ok (ft-get-balance vault-shares account)))
