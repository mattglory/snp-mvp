;; strategy-manager-v2.clar
;; Stacks Nexus Protocol - Multi-Strategy Manager
;; Manages multiple yield strategies with weighted allocation
;;
;; Features:
;; - Support up to 10 strategies simultaneously
;; - Weighted allocation (basis points)
;; - Rebalancing across strategies
;; - Multi-strategy harvest
;; - Strategy isolation and emergency procedures

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u300))
(define-constant ERR-STRATEGY-EXISTS (err u301))
(define-constant ERR-STRATEGY-NOT-FOUND (err u302))
(define-constant ERR-INVALID-WEIGHT (err u303))
(define-constant ERR-WEIGHT-SUM-INVALID (err u304))
(define-constant ERR-STRATEGY-INACTIVE (err u305))
(define-constant ERR-MAX-STRATEGIES (err u306))
(define-constant ERR-MIN-ALLOCATION (err u307))
(define-constant ERR-INSUFFICIENT-FUNDS (err u308))
(define-constant ERR-REBALANCE-IN-PROGRESS (err u309))
(define-constant ERR-STRATEGY-UNHEALTHY (err u310))

;; Constants
(define-constant contract-owner tx-sender)
(define-constant MAX-STRATEGIES u12)
(define-constant MIN-WEIGHT u500)        ;; 5% minimum (500 basis points)
(define-constant MAX-WEIGHT u5000)       ;; 50% maximum (5000 basis points)
(define-constant TOTAL-WEIGHT u10000)    ;; 100% = 10000 basis points
(define-constant VAULT-ADDRESS tx-sender) ;; Will be set to vault contract

;; Data vars
(define-data-var strategy-count uint u0)
(define-data-var total-allocated uint u0)
(define-data-var rebalance-in-progress bool false)
(define-data-var vault-contract principal tx-sender)

;; Strategy information
(define-map strategies
  principal  ;; Strategy address
  {
    weight: uint,           ;; Allocation percentage (basis points)
    active: bool,           ;; Is strategy enabled?
    allocated: uint,        ;; Current STX allocated
    total-earned: uint,     ;; Lifetime earnings
    last-harvest: uint,     ;; Last harvest block
    emergency: bool,        ;; Emergency mode flag
    health-score: uint      ;; Health rating (0-100)
  })

;; List of active strategy addresses
(define-data-var active-strategies (list 12 principal) (list))

;; Strategy performance tracking
(define-map strategy-performance
  principal
  {
    apy-estimate: uint,     ;; Current APY estimate
    total-deposits: uint,   ;; Total deposited
    total-withdrawals: uint,;; Total withdrawn
    harvest-count: uint,    ;; Number of harvests
    last-apy-update: uint   ;; Last APY calculation
  })

;; --- Admin Functions ---

(define-read-only (is-authorized)
  (or (is-eq tx-sender contract-owner)
      (is-eq tx-sender (var-get vault-contract))))

(define-public (set-vault (new-vault principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-NOT-AUTHORIZED)
    (var-set vault-contract new-vault)
    (ok true)))

;; --- Strategy Management ---

(define-public (add-strategy (strategy principal) (weight uint))
  (begin
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (asserts! (is-none (map-get? strategies strategy)) ERR-STRATEGY-EXISTS)
    (asserts! (< (var-get strategy-count) MAX-STRATEGIES) ERR-MAX-STRATEGIES)
    (asserts! (>= weight MIN-WEIGHT) ERR-INVALID-WEIGHT)
    (asserts! (<= weight MAX-WEIGHT) ERR-INVALID-WEIGHT)
    
    ;; Check total weight won't exceed 100%
    (let ((current-total (get-total-weight)))
      (asserts! (<= (+ current-total weight) TOTAL-WEIGHT) ERR-WEIGHT-SUM-INVALID)
      
      ;; Add strategy
      (map-set strategies strategy {
        weight: weight,
        active: true,
        allocated: u0,
        total-earned: u0,
        last-harvest: burn-block-height,
        emergency: false,
        health-score: u100
      })
      
      ;; Initialize performance tracking
      (map-set strategy-performance strategy {
        apy-estimate: u0,
        total-deposits: u0,
        total-withdrawals: u0,
        harvest-count: u0,
        last-apy-update: burn-block-height
      })
      
      ;; Update active strategies list
      (var-set active-strategies 
        (unwrap-panic (as-max-len? (append (var-get active-strategies) strategy) u12)))
      (var-set strategy-count (+ (var-get strategy-count) u1))
      
      (ok true))))

(define-public (update-strategy-weight (strategy principal) (new-weight uint))
  (let ((strategy-data (unwrap! (map-get? strategies strategy) ERR-STRATEGY-NOT-FOUND)))
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (asserts! (get active strategy-data) ERR-STRATEGY-INACTIVE)
    (asserts! (>= new-weight MIN-WEIGHT) ERR-INVALID-WEIGHT)
    (asserts! (<= new-weight MAX-WEIGHT) ERR-INVALID-WEIGHT)
    
    ;; Check total weight will still be valid
    (let ((old-weight (get weight strategy-data))
          (current-total (get-total-weight)))
      (let ((new-total (+ (- current-total old-weight) new-weight)))
        (asserts! (<= new-total TOTAL-WEIGHT) ERR-WEIGHT-SUM-INVALID)
        
        ;; Update weight
        (map-set strategies strategy 
          (merge strategy-data { weight: new-weight }))
        
        (ok true)))))

(define-public (disable-strategy (strategy principal))
  (let ((strategy-data (unwrap! (map-get? strategies strategy) ERR-STRATEGY-NOT-FOUND)))
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (asserts! (get active strategy-data) ERR-STRATEGY-INACTIVE)
    
    ;; Mark as inactive
    (map-set strategies strategy 
      (merge strategy-data { active: false, weight: u0 }))
    
    ;; Remove from active list (filter out)
    (var-set active-strategies 
      (filter is-not-strategy (var-get active-strategies)))
    (var-set strategy-count (- (var-get strategy-count) u1))
    
    (ok true)))

(define-private (is-not-strategy (s principal))
  (let ((strategy-data (map-get? strategies s)))
    (match strategy-data
      data (get active data)
      true)))

;; --- Allocation & Rebalancing ---

(define-public (allocate-funds (total-amount uint))
  (begin
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (asserts! (not (var-get rebalance-in-progress)) ERR-REBALANCE-IN-PROGRESS)
    
    ;; Allocate to each strategy based on weight
    (var-set rebalance-in-progress true)
    (let ((result (fold allocate-to-strategy 
                        (var-get active-strategies) 
                        { total: total-amount, success: true })))
      (var-set rebalance-in-progress false)
      (ok (get total result)))))

(define-private (allocate-to-strategy 
  (strategy principal) 
  (context { total: uint, success: bool }))
  (if (not (get success context))
    context
    (let ((strategy-data (unwrap-panic (map-get? strategies strategy))))
      (if (not (get active strategy-data))
        context
        (let ((allocation (/ (* (get total context) (get weight strategy-data)) TOTAL-WEIGHT)))
          ;; For local testing, just track allocation
          ;; TODO: Replace with actual contract call on deployment
          ;; (match (contract-call? strategy deposit allocation) ...)
          (begin
            ;; Update allocated amount
            (map-set strategies strategy
              (merge strategy-data { 
                allocated: (+ (get allocated strategy-data) allocation)
              }))
            (var-set total-allocated (+ (var-get total-allocated) allocation))
            { total: (- (get total context) allocation), success: true }))))))

(define-public (rebalance (total-available uint))
  (begin
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (asserts! (not (var-get rebalance-in-progress)) ERR-REBALANCE-IN-PROGRESS)
    
    ;; For each strategy:
    ;; 1. Calculate target allocation
    ;; 2. Compare to current allocation
    ;; 3. Adjust (deposit or withdraw)
    (var-set rebalance-in-progress true)
    (let ((result (fold rebalance-strategy 
                        (var-get active-strategies)
                        { total: total-available, success: true })))
      (var-set rebalance-in-progress false)
      (ok (get success result)))))

(define-private (rebalance-strategy
  (strategy principal)
  (context { total: uint, success: bool }))
  (if (not (get success context))
    context
    (let ((strategy-data (unwrap-panic (map-get? strategies strategy))))
      (if (not (get active strategy-data))
        context
        (let ((target-allocation (/ (* (get total context) (get weight strategy-data)) TOTAL-WEIGHT))
              (current-allocation (get allocated strategy-data)))
          (if (> target-allocation current-allocation)
            ;; Need to deposit more
            (let ((amount-to-deposit (- target-allocation current-allocation)))
              ;; For local testing, just track the allocation
              ;; TODO: Replace with actual contract call on deployment
              ;; (match (contract-call? strategy deposit amount-to-deposit) ...)
              (begin
                (map-set strategies strategy
                  (merge strategy-data { allocated: target-allocation }))
                { total: (- (get total context) amount-to-deposit), success: true }))
            ;; Need to withdraw some
            (let ((amount-to-withdraw (- current-allocation target-allocation)))
              ;; For local testing, just track the allocation
              ;; TODO: Replace with actual contract call on deployment
              ;; (match (contract-call? strategy withdraw amount-to-withdraw) ...)
              (begin
                (map-set strategies strategy
                    (merge strategy-data { allocated: target-allocation }))
                  { total: (+ (get total context) amount-to-withdraw), success: true }))))))))

;; --- Multi-Strategy Harvest ---

(define-public (harvest-all)
  (begin
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (let ((result (fold harvest-strategy 
                        (var-get active-strategies) 
                        { total: u0, success: true })))
      (if (get success result)
        (ok (get total result))
        (err u0)))))

(define-private (harvest-strategy 
  (strategy principal) 
  (context { total: uint, success: bool }))
  (let ((strategy-data (unwrap-panic (map-get? strategies strategy))))
    (if (not (get active strategy-data))
      context
      ;; For local testing, simulate harvest with 0 rewards
      ;; TODO: Replace with actual contract call on deployment
      ;; (match (contract-call? strategy harvest) ...)
      (let ((rewards u0))
        (begin
          ;; Update strategy data
          (map-set strategies strategy
            (merge strategy-data { 
              total-earned: (+ (get total-earned strategy-data) rewards),
              last-harvest: burn-block-height
            }))
          ;; Update performance tracking
          (let ((perf (unwrap-panic (map-get? strategy-performance strategy))))
            (map-set strategy-performance strategy
              (merge perf { harvest-count: (+ (get harvest-count perf) u1) })))
          { total: (+ (get total context) rewards), success: true })))))

;; --- Emergency Procedures ---

(define-public (emergency-pause-strategy (strategy principal))
  (let ((strategy-data (unwrap! (map-get? strategies strategy) ERR-STRATEGY-NOT-FOUND)))
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    
    ;; Mark strategy as emergency
    (map-set strategies strategy
      (merge strategy-data { emergency: true, active: false }))
    
    (ok true)))

(define-public (emergency-withdraw-from-strategy (strategy principal))
  (let ((strategy-data (unwrap! (map-get? strategies strategy) ERR-STRATEGY-NOT-FOUND)))
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (asserts! (get emergency strategy-data) ERR-STRATEGY-UNHEALTHY)
    
    ;; Attempt to withdraw all funds
    (let ((allocated (get allocated strategy-data)))
      ;; For local testing, just update the allocation tracking
      ;; TODO: Replace with actual contract call on deployment
      ;; (match (contract-call? strategy withdraw allocated) ...)
      (begin
        (map-set strategies strategy
          (merge strategy-data { allocated: u0 }))
        (var-set total-allocated (- (var-get total-allocated) allocated))
        (ok allocated)))))

(define-public (emergency-withdraw-all)
  (begin
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    
    ;; Withdraw from all strategies
    (let ((result (fold emergency-withdraw-helper 
                        (var-get active-strategies) 
                        { total: u0, success: true })))
      (if (get success result)
        (ok (get total result))
        ERR-INSUFFICIENT-FUNDS))))

(define-private (emergency-withdraw-helper
  (strategy principal)
  (context { total: uint, success: bool }))
  (let ((strategy-data (unwrap-panic (map-get? strategies strategy))))
    (let ((allocated (get allocated strategy-data))
          (recovered allocated)) ;; For local testing, assume full recovery
      ;; TODO: Replace with actual contract call on deployment
      ;; (match (contract-call? strategy emergency-exit) ...)
      (begin
        (map-set strategies strategy
          (merge strategy-data { allocated: u0, emergency: true }))
        { total: (+ (get total context) recovered), success: true }))))

;; --- View Functions ---

(define-read-only (get-strategy-info (strategy principal))
  (ok (unwrap! (map-get? strategies strategy) ERR-STRATEGY-NOT-FOUND)))

(define-read-only (get-strategy-performance (strategy principal))
  (ok (unwrap! (map-get? strategy-performance strategy) ERR-STRATEGY-NOT-FOUND)))

(define-read-only (get-all-strategies)
  (ok (var-get active-strategies)))

(define-read-only (get-strategy-count)
  (ok (var-get strategy-count)))

(define-read-only (get-total-allocated)
  (ok (var-get total-allocated)))

(define-read-only (get-total-weight)
  (fold sum-weights (var-get active-strategies) u0))

(define-private (sum-weights (strategy principal) (total uint))
  (let ((strategy-data (map-get? strategies strategy)))
    (match strategy-data
      data (if (get active data)
             (+ total (get weight data))
             total)
      total)))

(define-read-only (get-strategy-allocation (strategy principal) (total-assets uint))
  (let ((strategy-data (unwrap! (map-get? strategies strategy) ERR-STRATEGY-NOT-FOUND)))
    (ok (/ (* total-assets (get weight strategy-data)) TOTAL-WEIGHT))))

(define-read-only (get-allocation-targets (total-assets uint))
  (ok (map calculate-target-allocation (var-get active-strategies))))

(define-private (calculate-target-allocation (strategy principal))
  (let ((strategy-data (unwrap-panic (map-get? strategies strategy))))
    {
      strategy: strategy,
      weight: (get weight strategy-data),
      current: (get allocated strategy-data),
      active: (get active strategy-data)
    }))

;; --- Health & Status Functions ---

(define-read-only (get-manager-status)
  (ok {
    strategy-count: (var-get strategy-count),
    total-allocated: (var-get total-allocated),
    total-weight: (get-total-weight),
    rebalance-in-progress: (var-get rebalance-in-progress),
    vault-contract: (var-get vault-contract)
  }))

(define-read-only (get-strategy-health (strategy principal))
  (let ((strategy-data (unwrap! (map-get? strategies strategy) ERR-STRATEGY-NOT-FOUND)))
    (ok {
      active: (get active strategy-data),
      emergency: (get emergency strategy-data),
      health-score: (get health-score strategy-data),
      allocated: (get allocated strategy-data),
      weight: (get weight strategy-data)
    })))

(define-read-only (get-all-strategy-health)
  (ok (map get-strategy-health-helper (var-get active-strategies))))

(define-private (get-strategy-health-helper (strategy principal))
  (let ((strategy-data (unwrap-panic (map-get? strategies strategy))))
    {
      strategy: strategy,
      active: (get active strategy-data),
      emergency: (get emergency strategy-data),
      health-score: (get health-score strategy-data),
      allocated: (get allocated strategy-data),
      weight: (get weight strategy-data),
      total-earned: (get total-earned strategy-data),
      last-harvest: (get last-harvest strategy-data)
    }))

;; Update strategy health score (called by monitoring systems)
(define-public (update-health-score (strategy principal) (new-score uint))
  (let ((strategy-data (unwrap! (map-get? strategies strategy) ERR-STRATEGY-NOT-FOUND)))
    (asserts! (is-authorized) ERR-NOT-AUTHORIZED)
    (asserts! (<= new-score u100) ERR-INVALID-WEIGHT)
    
    (map-set strategies strategy
      (merge strategy-data { health-score: new-score }))
    
    ;; Auto-trigger emergency if health drops too low
    (if (< new-score u20)
      (map-set strategies strategy
        (merge strategy-data { emergency: true, active: false }))
      true)
    
    (ok true)))

;; Get yield summary across all strategies
(define-read-only (get-yield-summary)
  (let ((total-earned (fold sum-earnings (var-get active-strategies) u0)))
    (ok {
      total-earned: total-earned,
      total-allocated: (var-get total-allocated),
      effective-apy: (if (> (var-get total-allocated) u0)
                       (/ (* total-earned u10000) (var-get total-allocated))
                       u0)
    })))

(define-private (sum-earnings (strategy principal) (total uint))
  (let ((strategy-data (map-get? strategies strategy)))
    (match strategy-data
      data (+ total (get total-earned data))
      total)))
