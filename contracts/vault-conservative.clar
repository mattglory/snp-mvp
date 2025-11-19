;; SNP Conservative Vault
;; Low-risk automated yield strategies for capital preservation
;; Target APY: 8-10%
;; Risk Score: 2/5

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-ALREADY-INITIALIZED (err u402))
(define-constant ERR-PAUSED (err u403))
(define-constant ERR-INSUFFICIENT-BALANCE (err u404))
(define-constant ERR-INSUFFICIENT-SHARES (err u405))
(define-constant ERR-ZERO-AMOUNT (err u406))
(define-constant ERR-SLIPPAGE-EXCEEDED (err u407))
(define-constant ERR-DEADLINE-PASSED (err u408))
(define-constant ERR-STRATEGY-NOT-WHITELISTED (err u409))
(define-constant ERR-STRATEGY-CALL-FAILED (err u410))
(define-constant ERR-MINIMUM-FIRST-DEPOSIT (err u411))

;; Conservative strategy - focus on stability
(define-constant MINIMUM-FIRST-DEPOSIT u1000000000) ;; 1000 STX
(define-constant DEAD-SHARES u1000)
(define-constant BURN-ADDRESS 'SP000000000000000000002Q6VF78)

;; Conservative fee structure (same 8% but more stable yields)
(define-constant PERFORMANCE-FEE-BPS u800) ;; 8% = 800 basis points

;; Data vars
(define-data-var contract-owner principal tx-sender)
(define-data-var initialized bool false)
(define-data-var paused bool false)
(define-data-var total-assets uint u0)
(define-data-var active-strategy (optional principal) none)

;; FT token
(define-fungible-token vault-shares-conservative)

;; Maps
(define-map strategy-whitelist principal bool)
(define-map strategy-assets principal uint)
(define-map user-deposits principal uint)

;; SIP-010 Functions
(define-read-only (get-name)
  (ok "SNP Conservative Vault Shares"))

(define-read-only (get-symbol)
  (ok "snSTX-CONS"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance vault-shares-conservative account)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply vault-shares-conservative)))

(define-read-only (get-token-uri)
  (ok (some u"https://snp-protocol.com/conservative-vault")))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (try! (ft-transfer? vault-shares-conservative amount sender recipient))
    (print {event: "transfer", sender: sender, recipient: recipient, amount: amount, memo: memo})
    (ok true)))

;; Admin Functions
(define-read-only (is-contract-owner)
  (is-eq tx-sender (var-get contract-owner)))

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (var-set contract-owner new-owner))))

(define-read-only (is-initialized)
  (var-get initialized))

(define-read-only (is-paused)
  (var-get paused))

(define-public (emergency-pause)
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (var-set paused true))))

(define-public (resume)
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (var-set paused false))))

;; Strategy Management
(define-public (whitelist-strategy (strategy principal) (whitelisted bool))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (ok (map-set strategy-whitelist strategy whitelisted))))

(define-read-only (is-strategy-whitelisted (strategy principal))
  (default-to false (map-get? strategy-whitelist strategy)))

(define-public (set-active-strategy (strategy principal))
  (begin
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (asserts! (is-strategy-whitelisted strategy) ERR-STRATEGY-NOT-WHITELISTED)
    (ok (var-set active-strategy (some strategy)))))

(define-read-only (get-active-strategy)
  (var-get active-strategy))

;; Vault Operations
(define-read-only (get-total-assets)
  (ok (var-get total-assets)))

(define-read-only (get-vault-stx-balance)
  (stx-get-balance (as-contract tx-sender)))

(define-read-only (get-share-price)
  (let ((total-supply (ft-get-supply vault-shares-conservative))
        (total-value (var-get total-assets)))
    (if (is-eq total-supply u0)
        u1000000  ;; 1:1 ratio (1 STX = 1 share, 6 decimals)
        (/ (* total-value u1000000) total-supply))))

(define-read-only (get-strategy-allocation (strategy principal))
  (ok (default-to u0 (map-get? strategy-assets strategy))))

(define-public (deposit (amount uint))
  (let ((caller tx-sender)
        (current-supply (ft-get-supply vault-shares-conservative))
        (share-price (get-share-price))
        (shares-to-mint (/ (* amount u1000000) share-price)))
    
    (asserts! (not (var-get paused)) ERR-PAUSED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    
    ;; First depositor protection
    (if (is-eq current-supply u0)
        (begin
          (asserts! (>= amount MINIMUM-FIRST-DEPOSIT) ERR-MINIMUM-FIRST-DEPOSIT)
          ;; Mint dead shares to burn address
          (try! (ft-mint? vault-shares-conservative DEAD-SHARES BURN-ADDRESS))
          (var-set initialized true))
        true)
    
    ;; Transfer STX from user to vault
    (try! (stx-transfer? amount caller (as-contract tx-sender)))
    
    ;; Mint shares to user
    (try! (ft-mint? vault-shares-conservative shares-to-mint caller))
    
    ;; Update total assets
    (var-set total-assets (+ (var-get total-assets) amount))
    
    ;; Track user deposit
    (map-set user-deposits caller (+ (default-to u0 (map-get? user-deposits caller)) amount))
    
    (print {
      event: "deposit",
      user: caller,
      amount: amount,
      shares: shares-to-mint,
      share-price: share-price,
      vault: "conservative"
    })
    
    (ok shares-to-mint)))

(define-public (withdraw (shares uint) (min-amount-out uint) (deadline uint))
  (let ((caller tx-sender)
        (user-balance (ft-get-balance vault-shares-conservative caller))
        (share-price (get-share-price))
        (gross-amount (/ (* shares share-price) u1000000))
        (fee (/ (* gross-amount PERFORMANCE-FEE-BPS) u10000))
        (net-amount (- gross-amount fee)))
    
    (asserts! (not (var-get paused)) ERR-PAUSED)
    (asserts! (>= user-balance shares) ERR-INSUFFICIENT-SHARES)
    (asserts! (>= net-amount min-amount-out) ERR-SLIPPAGE-EXCEEDED)
    (asserts! (<= block-height deadline) ERR-DEADLINE-PASSED)
    
    ;; Burn shares
    (try! (ft-burn? vault-shares-conservative shares caller))
    
    ;; Transfer STX to user
    (try! (as-contract (stx-transfer? net-amount tx-sender caller)))
    
    ;; Update total assets
    (var-set total-assets (- (var-get total-assets) gross-amount))
    
    (print {
      event: "withdrawal",
      user: caller,
      shares: shares,
      gross-amount: gross-amount,
      fee: fee,
      net-amount: net-amount,
      vault: "conservative"
    })
    
    (ok net-amount)))

(define-read-only (preview-withdraw (shares uint))
  (let ((share-price (get-share-price))
        (gross-amount (/ (* shares share-price) u1000000))
        (fee (/ (* gross-amount PERFORMANCE-FEE-BPS) u10000))
        (net-amount (- gross-amount fee)))
    (ok {
      gross-amount: gross-amount,
      fee: fee,
      net-amount: net-amount,
      current-block: block-height
    })))

;; Strategy trait for type checking
(define-trait strategy-trait
  (
    (deposit (uint) (response uint uint))
    (withdraw (uint) (response uint uint))
    (harvest () (response uint uint))
  ))

;; Strategy allocation (conservative - low risk focus)
(define-public (allocate-to-strategy (strategy <strategy-trait>) (amount uint))
  (let ((strategy-addr (contract-of strategy)))
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    (asserts! (is-strategy-whitelisted strategy-addr) ERR-STRATEGY-NOT-WHITELISTED)
    
    ;; Transfer STX to strategy
    (try! (as-contract (stx-transfer? amount tx-sender strategy-addr)))
    
    ;; Call strategy deposit
    (try! (contract-call? strategy deposit amount))
    
    ;; Update strategy allocation
    (map-set strategy-assets strategy-addr
      (+ (default-to u0 (map-get? strategy-assets strategy-addr)) amount))
    
    (print {
      event: "strategy-allocation",
      strategy: strategy-addr,
      amount: amount,
      vault: "conservative"
    })
    
    (ok true)))

(define-public (harvest-strategy (strategy <strategy-trait>))
  (let ((rewards (unwrap! (contract-call? strategy harvest) ERR-STRATEGY-CALL-FAILED)))
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    
    ;; Update total assets with rewards
    (var-set total-assets (+ (var-get total-assets) rewards))
    
    (print {
      event: "harvest",
      strategy: (contract-of strategy),
      rewards: rewards,
      vault: "conservative"
    })
    
    (ok rewards)))

(define-public (emergency-withdraw-from-strategy (strategy <strategy-trait>) (amount uint))
  (let ((withdrawn-amount (unwrap! (contract-call? strategy withdraw amount) ERR-STRATEGY-CALL-FAILED))
        (strategy-addr (contract-of strategy)))
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)
    
    (map-set strategy-assets strategy-addr
      (- (default-to u0 (map-get? strategy-assets strategy-addr)) amount))
    
    (print {
      event: "emergency-withdraw",
      strategy: strategy-addr,
      amount: withdrawn-amount,
      vault: "conservative"
    })
    
    (ok withdrawn-amount)))

;; Read-only helpers
(define-read-only (get-balance-of (account principal))
  (ok (ft-get-balance vault-shares-conservative account)))

;; Vault metadata
(define-read-only (get-vault-info)
  (ok {
    name: "SNP Conservative Vault",
    symbol: "snSTX-CONS",
    target-apy: "8-10%",
    risk-score: u2,
    total-assets: (var-get total-assets),
    total-supply: (ft-get-supply vault-shares-conservative),
    share-price: (get-share-price),
    strategy-focus: "Stable yields, capital preservation",
    initialized: (var-get initialized),
    paused: (var-get paused)
  }))
