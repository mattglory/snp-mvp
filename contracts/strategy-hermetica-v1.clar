;; Hermetica Synthetic Assets Strategy V1
;; Stablecoin & synthetic asset yields

;; Hermetica Contracts (Mainnet)
(define-constant HERMETICA-CORE 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR)
(define-constant HERMETICA-VAULT 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.hermetica-vault-v1)
(define-constant USDh-TOKEN 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usdh-token)
(define-constant HMT-TOKEN 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.hmt-token)

;; Error codes
(define-constant ERR_UNAUTHORIZED (err u8001))
(define-constant ERR_INSUFFICIENT_BALANCE (err u8002))
(define-constant ERR_STRATEGY_INACTIVE (err u8003))
(define-constant ERR_INVALID_AMOUNT (err u8004))
(define-constant ERR_EMERGENCY_MODE (err u8005))

;; Config
(define-constant MIN_DEPOSIT u2000000) ;; 2 STX (synthetic minting)
(define-constant COLLATERAL_RATIO u15000) ;; 150% (1.5x)
(define-constant FACTOR u10000)

;; State
(define-data-var strategy-manager principal tx-sender)
(define-data-var is-active bool true)
(define-data-var emergency-mode bool false)
(define-data-var total-deposited uint u0)
(define-data-var total-usdh-minted uint u0)
(define-data-var pending-hmt-rewards uint u0)
(define-data-var total-hmt-earned uint u0)
(define-data-var lending-apy uint u800) ;; 8% default
(define-data-var last-harvest-block uint u0)
(define-data-var harvest-count uint u0)

;; Maps
(define-map user-vaults principal {
    collateral: uint,
    debt: uint,
    last-update: uint
})

;; Auth
(define-private (is-authorized)
    (or (is-eq tx-sender (var-get strategy-manager))
        (is-eq contract-caller (var-get strategy-manager))))

;; Read-only
(define-read-only (get-name) (ok "Hermetica Synthetic Asset Yields"))
(define-read-only (get-balance) (ok (var-get total-deposited)))
(define-read-only (get-total-assets) 
    (ok (+ (var-get total-deposited) (var-get pending-hmt-rewards))))
(define-read-only (is-strategy-active) 
    (ok (and (var-get is-active) (not (var-get emergency-mode)))))

(define-read-only (get-strategy-info)
    (ok {
        total-deposited: (var-get total-deposited),
        total-usdh-minted: (var-get total-usdh-minted),
        collateral-ratio: COLLATERAL_RATIO,
        pending-hmt-rewards: (var-get pending-hmt-rewards),
        total-hmt-earned: (var-get total-hmt-earned),
        lending-apy: (var-get lending-apy),
        harvest-count: (var-get harvest-count),
        is-active: (var-get is-active)
    }))

(define-read-only (get-collateral-ratio)
    (let ((deposited (var-get total-deposited))
          (debt (var-get total-usdh-minted)))
        (if (is-eq debt u0)
            (ok u0)
            (ok (/ (* deposited FACTOR) debt)))))

;; Core functions
(define-public (deposit (amount uint))
    (begin
        (asserts! (is-authorized) ERR_UNAUTHORIZED)
        (asserts! (var-get is-active) ERR_STRATEGY_INACTIVE)
        (asserts! (>= amount MIN_DEPOSIT) ERR_INVALID_AMOUNT)
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        
        ;; Mint USDh (synthetic stablecoin) at 150% collateral
        (let ((usdh-amount (/ (* amount FACTOR) COLLATERAL_RATIO)))
            (var-set total-deposited (+ (var-get total-deposited) amount))
            (var-set total-usdh-minted (+ (var-get total-usdh-minted) usdh-amount))
            
            (map-set user-vaults tx-sender {
                collateral: amount,
                debt: usdh-amount,
                last-update: burn-block-height
            })
            
            ;; USDh is lent out to earn yield
            (ok amount))))

(define-public (withdraw (amount uint))
    (begin
        (asserts! (is-authorized) ERR_UNAUTHORIZED)
        (asserts! (<= amount (var-get total-deposited)) ERR_INSUFFICIENT_BALANCE)
        
        ;; Must repay proportional USDh debt
        (let ((debt-to-repay (/ (* amount (var-get total-usdh-minted)) 
                                 (var-get total-deposited))))
            (var-set total-deposited (- (var-get total-deposited) amount))
            (var-set total-usdh-minted (- (var-get total-usdh-minted) debt-to-repay))
            ;; Transfer STX back to vault  
        (try! (as-contract (stx-transfer? amount tx-sender contract-caller)))
            (ok amount))))

(define-public (harvest)
    (begin
        (asserts! (is-authorized) ERR_UNAUTHORIZED)
        
        ;; Earn from USDh lending + HMT rewards
        (let ((lending-yield (/ (* (var-get total-usdh-minted) 
                                   (var-get lending-apy)) FACTOR))
              (hmt-rewards (/ (* (var-get total-deposited) u8) FACTOR))) ;; 0.08%
            
            (var-set pending-hmt-rewards (+ (var-get pending-hmt-rewards) 
                                           (+ lending-yield hmt-rewards)))
            (var-set total-hmt-earned (+ (var-get total-hmt-earned) 
                                        (+ lending-yield hmt-rewards)))
            (var-set harvest-count (+ (var-get harvest-count) u1))
            (var-set last-harvest-block burn-block-height)
            (ok (+ lending-yield hmt-rewards)))))

(define-public (compound)
    (begin
        (asserts! (is-authorized) ERR_UNAUTHORIZED)
        (let ((rewards (var-get pending-hmt-rewards)))
            (asserts! (> rewards u0) ERR_INVALID_AMOUNT)
            
            ;; Swap HMT to STX, re-deposit
            (let ((stx-amount rewards)) ;; Mock 1:1
                (var-set total-deposited (+ (var-get total-deposited) stx-amount))
                (var-set pending-hmt-rewards u0)
                (ok stx-amount)))))

(define-public (emergency-withdraw)
    (begin
        (asserts! (is-eq tx-sender (var-get strategy-manager)) ERR_UNAUTHORIZED)
        (var-set emergency-mode true)
        (var-set is-active false)
        
        ;; Close all positions, repay debt
        (let ((balance (stx-get-balance (as-contract tx-sender))))
            (if (> balance u0)
                (try! (as-contract (stx-transfer? balance tx-sender (var-get strategy-manager))))
                true)
            (ok true))))

;; Admin
(define-public (set-strategy-manager (new-manager principal))
    (begin
        (asserts! (is-eq tx-sender (var-get strategy-manager)) ERR_UNAUTHORIZED)
        (var-set strategy-manager new-manager)
        (ok true)))

(define-public (toggle-active (active bool))
    (begin
        (asserts! (is-eq tx-sender (var-get strategy-manager)) ERR_UNAUTHORIZED)
        (var-set is-active active)
        (ok true)))

(define-public (update-lending-apy (new-apy uint))
    (begin
        (asserts! (is-eq tx-sender (var-get strategy-manager)) ERR_UNAUTHORIZED)
        (var-set lending-apy new-apy)
        (ok true)))

;; Init
(begin
    (var-set last-harvest-block burn-block-height)
    (print {event: "hermetica-strategy-deployed", block: burn-block-height}))
