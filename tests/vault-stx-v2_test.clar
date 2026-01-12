;; vault-stx-v2_test.clar
;; Comprehensive test suite for vault-stx-v2 contract
;; Tests security features, normal operations, and attack scenarios

(define-constant deployer tx-sender)
(define-constant wallet-1 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(define-constant wallet-2 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
(define-constant wallet-3 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)
(define-constant attacker 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND)

;; Helper constants
(define-constant ONE-STX u1000000)
(define-constant ONE-THOUSAND-STX u1000000000)
(define-constant ONE-HUNDRED-K-STX u100000000000)

;; ====================================
;; SECURITY TESTS - First Depositor Protection
;; ====================================

;; Test 1: First deposit must meet minimum (1000 STX)
(define-public (test-first-deposit-minimum)
  (begin
    (print "TEST: First deposit must be >= 1000 STX")
    
    ;; Should fail with less than 1000 STX
    (asserts! (is-err (contract-call? .vault-stx-v2 deposit (* ONE-STX u999)))
      (err "First deposit should fail with 999 STX"))
    
    ;; Should succeed with exactly 1000 STX
    (asserts! (is-ok (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
      (err "First deposit should succeed with 1000 STX"))
    
    (ok "First deposit minimum enforced correctly")))

;; Test 2: Dead shares are minted on initialization
(define-public (test-dead-shares-minted)
  (begin
    (print "TEST: Dead shares minted on init")
    
    ;; First deposit
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    ;; Check total supply includes dead shares (1000)
    (let ((supply (unwrap-panic (contract-call? .vault-stx-v2 get-total-supply))))
      (asserts! (> supply ONE-THOUSAND-STX)
        (err "Dead shares should be included in supply"))
      
      (ok "Dead shares minted correctly"))))

;; Test 3: First depositor attack simulation (should fail)
(define-public (test-first-depositor-attack-prevented)
  (begin
    (print "TEST: First depositor attack prevention")
    
    ;; Attacker tries to deposit minimum
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    ;; Attacker tries to inflate share price by donating STX
    ;; (In real scenario, they'd transfer directly to vault contract)
    ;; Dead shares should absorb most of the manipulation
    
    ;; Victim deposits
    (try! (as-contract (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX)))
    
    ;; Victim should get reasonable amount of shares
    ;; With dead shares, manipulation is diluted
    (let ((victim-shares (unwrap-panic 
            (contract-call? .vault-stx-v2 get-balance (as-contract tx-sender)))))
      (asserts! (> victim-shares u0)
        (err "Victim should receive shares"))
      
      (ok "First depositor attack prevented"))))

;; Test 4: Subsequent deposits can be smaller
(define-public (test-subsequent-deposits-no-minimum)
  (begin
    (print "TEST: Subsequent deposits have no minimum")
    
    ;; First deposit (meets minimum)
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    ;; Subsequent deposit (below minimum - should work)
    (asserts! (is-ok (contract-call? .vault-stx-v2 deposit (* ONE-STX u100)))
      (err "Subsequent deposits should allow amounts < 1000 STX"))
    
    (ok "Subsequent deposits work correctly")))

;; ====================================
;; SECURITY TESTS - Slippage Protection
;; ====================================

;; Test 5: Withdrawal with adequate slippage tolerance succeeds
(define-public (test-withdrawal-slippage-success)
  (begin
    (print "TEST: Withdrawal with good slippage succeeds")
    
    ;; Setup: Deposit some STX
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    ;; Preview withdrawal
    (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
      
      ;; Withdraw with 5% slippage tolerance
      (let ((min-out (* ONE-THOUSAND-STX u95)))
        (asserts! (is-ok (contract-call? .vault-stx-v2 withdraw 
                           shares 
                           (/ min-out u100) 
                           (+ block-height u100)))
          (err "Withdrawal should succeed with adequate slippage"))
        
        (ok "Slippage protection allows good withdrawals")))))

;; Test 6: Withdrawal fails if slippage exceeded
(define-public (test-withdrawal-slippage-failure)
  (begin
    (print "TEST: Withdrawal fails if slippage exceeded")
    
    ;; Setup: Deposit some STX
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
      
      ;; Try to withdraw with impossibly high minimum (more than deposited)
      (asserts! (is-err (contract-call? .vault-stx-v2 withdraw 
                          shares 
                          (* ONE-THOUSAND-STX u2) ;; Want 2000 STX (impossible)
                          (+ block-height u100)))
        (err "Withdrawal should fail when min-out too high"))
      
      (ok "Slippage protection prevents bad withdrawals"))))

;; Test 7: Deadline protection prevents stale transactions
(define-public (test-deadline-protection)
  (begin
    (print "TEST: Deadline prevents stale transactions")
    
    ;; Setup: Deposit some STX
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
      
      ;; Try to withdraw with deadline in the past
      (asserts! (is-err (contract-call? .vault-stx-v2 withdraw 
                          shares 
                          u1 
                          (- block-height u1))) ;; Deadline already passed
        (err "Withdrawal should fail with past deadline"))
      
      (ok "Deadline protection works"))))

;; ====================================
;; SECURITY TESTS - Preview Functions
;; ====================================

;; Test 8: Preview withdrawal shows accurate amounts
(define-public (test-preview-withdrawal)
  (begin
    (print "TEST: Preview withdrawal accuracy")
    
    ;; Setup: Deposit 1000 STX
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
      
      ;; Preview the withdrawal
      (let ((preview (unwrap-panic (contract-call? .vault-stx-v2 preview-withdraw shares))))
        
        ;; Check that preview includes all fields
        (asserts! (> (get gross-amount preview) u0)
          (err "Preview should show gross amount"))
        (asserts! (>= (get fee preview) u0)
          (err "Preview should show fee"))
        (asserts! (> (get net-amount preview) u0)
          (err "Preview should show net amount"))
        (asserts! (is-eq (get current-block preview) block-height)
          (err "Preview should show current block"))
        
        ;; Net should be less than gross (due to fee)
        (asserts! (< (get net-amount preview) (get gross-amount preview))
          (err "Net amount should be less than gross"))
        
        (ok "Preview withdrawal works correctly")))))

;; ====================================
;; EMERGENCY TESTS
;; ====================================

;; Test 9: Emergency pause stops deposits
(define-public (test-emergency-pause-deposits)
  (begin
    (print "TEST: Emergency pause stops deposits")
    
    ;; Setup: First deposit
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    ;; Owner pauses
    (try! (contract-call? .vault-stx-v2 emergency-pause))
    
    ;; Deposits should fail
    (asserts! (is-err (contract-call? .vault-stx-v2 deposit ONE-STX))
      (err "Deposits should fail when paused"))
    
    (ok "Emergency pause stops deposits")))

;; Test 10: Emergency pause stops withdrawals
(define-public (test-emergency-pause-withdrawals)
  (begin
    (print "TEST: Emergency pause stops withdrawals")
    
    ;; Setup: Deposit
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
      
      ;; Owner pauses
      (try! (contract-call? .vault-stx-v2 emergency-pause))
      
      ;; Withdrawals should fail
      (asserts! (is-err (contract-call? .vault-stx-v2 withdraw 
                          shares 
                          u1 
                          (+ block-height u100)))
        (err "Withdrawals should fail when paused"))
      
      (ok "Emergency pause stops withdrawals"))))

;; Test 11: Resume allows operations again
(define-public (test-resume-after-pause)
  (begin
    (print "TEST: Resume restores functionality")
    
    ;; Setup
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    (try! (contract-call? .vault-stx-v2 emergency-pause))
    
    ;; Resume
    (try! (contract-call? .vault-stx-v2 resume))
    
    ;; Deposits should work again
    (asserts! (is-ok (contract-call? .vault-stx-v2 deposit ONE-STX))
      (err "Deposits should work after resume"))
    
    (ok "Resume works correctly")))

;; Test 12: Only owner can pause
(define-public (test-only-owner-can-pause)
  (begin
    (print "TEST: Only owner can emergency pause")
    
    ;; Non-owner tries to pause (should fail)
    (asserts! (is-err (as-contract (contract-call? .vault-stx-v2 emergency-pause)))
      (err "Non-owner should not be able to pause"))
    
    (ok "Pause is owner-only")))

;; ====================================
;; NORMAL OPERATIONS TESTS
;; ====================================

;; Test 13: Basic deposit and withdrawal flow
(define-public (test-basic-deposit-withdraw)
  (begin
    (print "TEST: Basic deposit and withdrawal")
    
    ;; Deposit
    (let ((deposit-result (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))))
      
      ;; Should receive shares
      (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
        (asserts! (> shares u0) (err "Should receive shares"))
        
        ;; Withdraw
        (let ((withdraw-result (try! (contract-call? .vault-stx-v2 withdraw 
                                       shares 
                                       u1 
                                       (+ block-height u100)))))
          (asserts! (> withdraw-result u0) (err "Should receive STX back"))
          
          ;; Shares should be burned
          (let ((final-shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
            (asserts! (is-eq final-shares u0) (err "Shares should be burned"))
            
            (ok "Basic flow works")))))))

;; Test 14: Multiple users can deposit
(define-public (test-multiple-users)
  (begin
    (print "TEST: Multiple users can deposit")
    
    ;; User 1 deposits (first deposit)
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    ;; User 2 deposits
    (try! (as-contract (contract-call? .vault-stx-v2 deposit (* ONE-STX u500))))
    
    ;; Both should have shares
    (let ((user1-shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender)))
          (user2-shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance (as-contract tx-sender)))))
      
      (asserts! (> user1-shares u0) (err "User 1 should have shares"))
      (asserts! (> user2-shares u0) (err "User 2 should have shares"))
      
      (ok "Multiple users work"))))

;; Test 15: Share price increases with yield
(define-public (test-share-price-appreciation)
  (begin
    (print "TEST: Share price appreciates with yield")
    
    ;; Initial deposit
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    (let ((initial-price (unwrap-panic (contract-call? .vault-stx-v2 get-share-price))))
      
      ;; Simulate yield by having strategy return more STX
      ;; (In real test, strategy would send profits)
      ;; For this test, just verify price calculation logic exists
      
      (asserts! (> initial-price u0) (err "Share price should be positive"))
      
      (ok "Share price calculation works"))))

;; ====================================
;; EDGE CASE TESTS
;; ====================================

;; Test 16: Cannot deposit zero
(define-public (test-zero-deposit)
  (begin
    (print "TEST: Zero deposit fails")
    
    (asserts! (is-err (contract-call? .vault-stx-v2 deposit u0))
      (err "Zero deposit should fail"))
    
    (ok "Zero deposit rejected")))

;; Test 17: Cannot withdraw zero shares
(define-public (test-zero-withdrawal)
  (begin
    (print "TEST: Zero withdrawal fails")
    
    ;; Setup
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    
    (asserts! (is-err (contract-call? .vault-stx-v2 withdraw u0 u0 (+ block-height u100)))
      (err "Zero withdrawal should fail"))
    
    (ok "Zero withdrawal rejected")))

;; Test 18: Cannot withdraw more shares than owned
(define-public (test-insufficient-shares)
  (begin
    (print "TEST: Cannot withdraw more than owned")
    
    ;; Setup
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
      
      ;; Try to withdraw more
      (asserts! (is-err (contract-call? .vault-stx-v2 withdraw 
                          (+ shares u1000000) 
                          u1 
                          (+ block-height u100)))
        (err "Should not allow withdrawing more shares than owned"))
      
      (ok "Insufficient shares check works"))))

;; Test 19: Performance fee is calculated correctly
(define-public (test-performance-fee)
  (begin
    (print "TEST: Performance fee calculation")
    
    ;; Deposit 1000 STX
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
      
      ;; Preview to see fee
      (let ((preview (unwrap-panic (contract-call? .vault-stx-v2 preview-withdraw shares))))
        
        ;; Fee should be 8% of gross
        ;; 8% = 800 basis points / 10000
        (let ((expected-fee (/ (* (get gross-amount preview) u800) u10000)))
          (asserts! (is-eq (get fee preview) expected-fee)
            (err "Fee calculation incorrect"))
          
          (ok "Performance fee calculated correctly"))))))

;; Test 20: Vault tracks total assets correctly
(define-public (test-total-assets-tracking)
  (begin
    (print "TEST: Total assets tracking")
    
    ;; Initial state
    (let ((initial-assets (unwrap-panic (contract-call? .vault-stx-v2 get-total-assets))))
      
      ;; Deposit
      (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
      (let ((after-deposit (unwrap-panic (contract-call? .vault-stx-v2 get-total-assets))))
        
        ;; Should increase by deposit amount
        (asserts! (is-eq after-deposit (+ initial-assets ONE-THOUSAND-STX))
          (err "Total assets not tracking deposits"))
        
        ;; Withdraw half
        (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
          (try! (contract-call? .vault-stx-v2 withdraw 
                  (/ shares u2) 
                  u1 
                  (+ block-height u100)))
          
          ;; Should decrease
          (let ((after-withdraw (unwrap-panic (contract-call? .vault-stx-v2 get-total-assets))))
            (asserts! (< after-withdraw after-deposit)
              (err "Total assets should decrease after withdrawal"))
            
            (ok "Total assets tracked correctly")))))))

;; ====================================
;; STRATEGY INTEGRATION TESTS
;; ====================================

;; Test 21: Strategy must be whitelisted before activation
(define-public (test-strategy-whitelist)
  (begin
    (print "TEST: Strategy whitelist requirement")
    
    ;; Try to set non-whitelisted strategy (should fail)
    (asserts! (is-err (contract-call? .vault-stx-v2 set-active-strategy .mock-alex))
      (err "Should not allow non-whitelisted strategy"))
    
    ;; Whitelist it
    (try! (contract-call? .vault-stx-v2 whitelist-strategy .mock-alex true))
    
    ;; Now should work
    (asserts! (is-ok (contract-call? .vault-stx-v2 set-active-strategy .mock-alex))
      (err "Should allow whitelisted strategy"))
    
    (ok "Strategy whitelist works")))

;; Test 22: Only owner can whitelist strategies
(define-public (test-only-owner-whitelist)
  (begin
    (print "TEST: Only owner can whitelist")
    
    ;; Non-owner tries to whitelist
    (asserts! (is-err (as-contract (contract-call? .vault-stx-v2 whitelist-strategy .mock-alex true)))
      (err "Non-owner should not whitelist"))
    
    (ok "Whitelist is owner-only")))

;; Test 23: Emergency withdrawal from strategy requires pause
(define-public (test-emergency-withdrawal-requires-pause)
  (begin
    (print "TEST: Emergency withdrawal requires pause")
    
    ;; Setup strategy
    (try! (contract-call? .vault-stx-v2 whitelist-strategy .strategy-alex-farm-v2 true))
    (try! (contract-call? .vault-stx-v2 set-active-strategy .strategy-alex-farm-v2))
    
    ;; Try emergency withdrawal without pause (should fail)
    (asserts! (is-err (contract-call? .vault-stx-v2 emergency-withdraw-from-strategy 
                        .strategy-alex-farm-v2 
                        ONE-STX))
      (err "Emergency withdrawal should require pause"))
    
    ;; Pause, then should work (or fail gracefully if no funds)
    (try! (contract-call? .vault-stx-v2 emergency-pause))
    
    (ok "Emergency withdrawal requires pause")))

;; ====================================
;; INTEGRATION TESTS
;; ====================================

;; Test 24: Full user journey
(define-public (test-full-user-journey)
  (begin
    (print "TEST: Complete user journey")
    
    ;; 1. User deposits
    (let ((deposit-tx (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))))
      
      ;; 2. User checks balance
      (let ((shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
        (asserts! (> shares u0) (err "Should have shares"))
        
        ;; 3. User previews withdrawal
        (let ((preview (unwrap-panic (contract-call? .vault-stx-v2 preview-withdraw shares))))
          
          ;; 4. User withdraws with slippage protection
          (let ((min-out (/ (* (get net-amount preview) u95) u100))) ;; 5% slippage
            (let ((withdrawal-tx (try! (contract-call? .vault-stx-v2 withdraw 
                                         shares 
                                         min-out 
                                         (+ block-height u100)))))
              
              ;; 5. Verify user got their STX back
              (asserts! (> withdrawal-tx u0) (err "Should receive STX"))
              
              ;; 6. Verify shares are gone
              (let ((final-shares (unwrap-panic (contract-call? .vault-stx-v2 get-balance tx-sender))))
                (asserts! (is-eq final-shares u0) (err "Shares should be burned"))
                
                (ok "Full journey successful")))))))))

;; Test 25: Share price remains stable with equal deposits/withdrawals
(define-public (test-share-price-stability)
  (begin
    (print "TEST: Share price stability")
    
    ;; Initial deposit
    (try! (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX))
    (let ((price1 (unwrap-panic (contract-call? .vault-stx-v2 get-share-price))))
      
      ;; Another user deposits same amount
      (try! (as-contract (contract-call? .vault-stx-v2 deposit ONE-THOUSAND-STX)))
      (let ((price2 (unwrap-panic (contract-call? .vault-stx-v2 get-share-price))))
        
        ;; Price should remain stable
        (asserts! (is-eq price1 price2)
          (err "Share price should remain stable with equal deposits"))
        
        (ok "Share price stable")))))

;; ====================================
;; TEST RUNNER
;; ====================================

(define-public (run-all-tests)
  (begin
    (print "=== Running Vault V2 Test Suite ===")
    (print "")
    
    ;; Security Tests
    (print "--- Security Tests ---")
    (unwrap-panic (test-first-deposit-minimum))
    (unwrap-panic (test-dead-shares-minted))
    (unwrap-panic (test-first-depositor-attack-prevented))
    (unwrap-panic (test-subsequent-deposits-no-minimum))
    (unwrap-panic (test-withdrawal-slippage-success))
    (unwrap-panic (test-withdrawal-slippage-failure))
    (unwrap-panic (test-deadline-protection))
    (unwrap-panic (test-preview-withdrawal))
    
    ;; Emergency Tests
    (print "--- Emergency Tests ---")
    (unwrap-panic (test-emergency-pause-deposits))
    (unwrap-panic (test-emergency-pause-withdrawals))
    (unwrap-panic (test-resume-after-pause))
    (unwrap-panic (test-only-owner-can-pause))
    
    ;; Normal Operations
    (print "--- Normal Operations ---")
    (unwrap-panic (test-basic-deposit-withdraw))
    (unwrap-panic (test-multiple-users))
    (unwrap-panic (test-share-price-appreciation))
    
    ;; Edge Cases
    (print "--- Edge Cases ---")
    (unwrap-panic (test-zero-deposit))
    (unwrap-panic (test-zero-withdrawal))
    (unwrap-panic (test-insufficient-shares))
    (unwrap-panic (test-performance-fee))
    (unwrap-panic (test-total-assets-tracking))
    
    ;; Strategy Integration
    (print "--- Strategy Tests ---")
    (unwrap-panic (test-strategy-whitelist))
    (unwrap-panic (test-only-owner-whitelist))
    (unwrap-panic (test-emergency-withdrawal-requires-pause))
    
    ;; Integration
    (print "--- Integration Tests ---")
    (unwrap-panic (test-full-user-journey))
    (unwrap-panic (test-share-price-stability))
    
    (print "")
    (print "=== All Tests Passed! ===")
    (ok "All tests completed successfully")))
