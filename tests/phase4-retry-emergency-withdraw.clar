;; ========================================
;; PHASE 4 RETRY: EMERGENCY WITHDRAW + USER WITHDRAWAL
;; ========================================

;; Current state:
;; - Vault has: 150 STX
;; - Need: 200 STX for withdrawal
;; - Solution: Pull 50 STX from strategy first

;; Step 1: Check current vault liquidity
(contract-call? .vault-stx-v2 get-vault-stx-balance)

;; Step 2: Emergency pause vault (required for emergency withdraw)
(contract-call? .vault-stx-v2 emergency-pause)

;; Step 3: Emergency withdraw 50 STX from strategy-sbtc-v1
(contract-call? .vault-stx-v2 emergency-withdraw-from-strategy .strategy-sbtc-v1 u50000000)

;; Step 4: Resume vault operations
(contract-call? .vault-stx-v2 resume)

;; Step 5: Verify vault now has enough liquidity
(contract-call? .vault-stx-v2 get-vault-stx-balance)

;; Step 6: Preview withdrawal again
(contract-call? .vault-stx-v2 preview-withdraw u200000000)

;; Step 7: Attempt withdrawal (should work now!)
(contract-call? .vault-stx-v2 withdraw u200000000 u190000000 u9999999)

;; Step 8: Verify results
(contract-call? .vault-stx-v2 get-balance tx-sender)
(contract-call? .vault-stx-v2 get-total-assets)
(contract-call? .vault-stx-v2 get-vault-stx-balance)

;; Expected Results:
;; ✅ Emergency withdraw successful
;; ✅ Vault liquidity increased to ~200 STX
;; ✅ User withdrawal succeeds
;; ✅ User receives ~184 STX (minus 8% fee)
;; ✅ User shares reduced to 800000000
