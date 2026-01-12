;; ALEX STX-USDA Strategy - TESTNET VERSION
;; Simplified for testnet deployment

;; Error codes
(define-constant ERR_UNAUTHORIZED (err u7400))
(define-constant ERR_INSUFFICIENT_BALANCE (err u7401))
(define-constant ERR_STRATEGY_INACTIVE (err u7402))
(define-constant ERR_INVALID_AMOUNT (err u7403))

;; Config
(define-constant MIN_DEPOSIT u1000000)
(define-constant SIMULATED_APY u650) ;; 6.5% APY

;; State
(define-data-var strategy-manager principal tx-sender)
(define-data-var vault-address (optional principal) none)
(define-data-var is-active bool true)
(define-data-var total-deployed uint u0)
(define-data-var total-rewards uint u0)
(define-data-var last-harvest-block uint u0)

;; Auth
(define-private (is-authorized)
    (or (is-eq tx-sender (var-get strategy-manager))
        (is-eq (some contract-caller) (var-get vault-address))))

;; Read-only
(define-read-only (get-name) (ok "ALEX STX-USDA Pool (Testnet)"))
(define-read-only (get-balance) (ok (var-get total-deployed)))
(define-read-only (get-total-assets) 
    (ok (+ (var-get total-deployed) (var-get total-rewards))))
(define-read-only (is-strategy-active) (ok (var-get is-active)))

(define-read-only (get-strategy-info)
    (ok {
        total-deployed: (var-get total-deployed),
        total-rewards: (var-get total-rewards),
        is-active: (var-get is-active)
    }))

;; Core Functions
(define-public (deposit (amount uint))
    (begin
        (asserts! (is-authorized) ERR_UNAUTHORIZED)
        (asserts! (var-get is-active) ERR_STRATEGY_INACTIVE)
        (asserts! (>= amount MIN_DEPOSIT) ERR_INVALID_AMOUNT)
        
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (var-set total-deployed (+ (var-get total-deployed) amount))
        (ok amount)))

(define-public (withdraw (amount uint))
    (begin
        (asserts! (is-authorized) ERR_UNAUTHORIZED)
        (asserts! (<= amount (var-get total-deployed)) ERR_INSUFFICIENT_BALANCE)
        
        ;; Transfer STX back to vault (contract-caller)
        (try! (as-contract (stx-transfer? amount tx-sender contract-caller)))
        (var-set total-deployed (- (var-get total-deployed) amount))
        (ok amount)))

(define-public (harvest)
    (begin
        (asserts! (is-authorized) ERR_UNAUTHORIZED)
        
        (let ((blocks-since-last (- burn-block-height (var-get last-harvest-block)))
              (rewards (/ (* (var-get total-deployed) SIMULATED_APY blocks-since-last) u52560000)))
            
            (var-set total-rewards (+ (var-get total-rewards) rewards))
            (var-set last-harvest-block burn-block-height)
            (ok rewards))))

;; Admin
(define-public (set-vault (new-vault principal))
    (begin
        (asserts! (is-eq tx-sender (var-get strategy-manager)) ERR_UNAUTHORIZED)
        (ok (var-set vault-address (some new-vault)))))

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

(begin
    (var-set last-harvest-block burn-block-height))
