;; ========================================
;; PHASE 4: WITHDRAWAL TEST
;; ========================================
;; Test withdrawing funds from vault

;; Check current user balance
(contract-call? .vault-stx-v2 get-balance tx-sender)

;; Preview withdrawal (200 STX worth of shares)
(contract-call? .vault-stx-v2 preview-withdraw u200000000)

;; Attempt withdrawal
;; Parameters: shares, min-amount-out, deadline (9999999 = far future)
(contract-call? .vault-stx-v2 withdraw u200000000 u190000000 u9999999)

;; Check updated balances
(contract-call? .vault-stx-v2 get-balance tx-sender)
(contract-call? .vault-stx-v2 get-total-assets)
(contract-call? .vault-stx-v2 get-vault-stx-balance)

;; Expected Results:
;; ✅ User receives ~184 STX back (minus 8% fee)
;; ✅ Share balance decreases by 200000000
;; ✅ Vault balance decreases
;; ✅ Total assets decreases
