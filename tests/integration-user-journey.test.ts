import { describe, expect, it } from 'vitest';
import { Cl } from '@stacks/transactions';

async function setupTest() {
  const { initSimnet } = await import('@hirosystems/clarinet-sdk');
  const simnet = await initSimnet();
  const accounts = simnet.getAccounts();
  const deployer = accounts.get('deployer')!;
  return { simnet, deployer, accounts };
}
/**
 * INTEGRATION TESTS - Complete User Journey
 * Tests realistic user flows from start to finish
 */

import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Integration: Complete User Journey", () => {
  
  beforeEach(() => {
    // Reset state between tests
  });

  describe("Journey 1: First-Time Depositor to Withdrawal", () => {
    it.skip("should complete full lifecycle: deposit → allocate → harvest → withdraw", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      // STEP 1: First user deposits (triggers first depositor protection)
      const depositAmount = 1500_000000; // 1500 STX
      const depositResult = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(depositAmount)],
        user1
      );
      
      expect(depositResult.result).toBeOk(Cl.uint(depositAmount - 1000)); // Minus dead shares
      
      // Verify dead shares were burned
      const deadShareBalance = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-balance-of",
        [Cl.principal("SP000000000000000000002Q6VF78")],
        user1
      );
      expect(deadShareBalance.result).toBe(Cl.uint(1000n));
      
      // STEP 2: Allocate funds to strategy (Conservative vault should use low-risk strategy)
      const allocationResult = simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(750_000000), // 50% allocation
        ],
        deployer
      );
      expect(allocationResult.result).toBeOk(Cl.bool(true));
      
      // STEP 3: Wait for yield generation (simulate time passing)
      simnet.mineEmptyBlocks(144); // ~1 day
      
      // STEP 4: Harvest yields
      const harvestResult = simnet.callPublicFn(
        "vault-stx-v2",
        "harvest-strategy",
        [Cl.principal(`${deployer}.strategy-stx-stacking`)],
        deployer
      );
      expect(harvestResult.result).toBeOk(Cl.uint); // Should return yield amount
      
      // STEP 5: User withdraws with slippage protection
      const withdrawShares = 500_000000;
      const minOutputWithSlippage = 490_000000; // Accept 2% slippage
      
      const withdrawResult = simnet.callPublicFn(
        "vault-stx-v2",
        "withdraw",
        [
          Cl.uint(withdrawShares),
          Cl.uint(minOutputWithSlippage),
          Cl.uint(simnet.blockHeight + 10) // deadline
        ],
        user1
      );
      
      expect(withdrawResult.result).toBeOk(Cl.uint);
      const withdrawnAmount = Cl.uint(withdrawResult.result);
      
      // Verify slippage protection worked
      expect(Number(withdrawnAmount)).toBeGreaterThanOrEqual(minOutputWithSlippage);
      
      // Verify user balance increased
      const finalBalance = simnet.getAssetsMap().get("STX")?.get(user1);
      expect(finalBalance).toBeGreaterThan(0);
    });
    
    it.skip("should handle deadline protection correctly", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const depositAmount = 1500_000000;
      
      // Deposit first
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(depositAmount)],
        user1
      );
      
      // Try to withdraw with expired deadline
      const expiredDeadline = simnet.blockHeight - 1;
      const withdrawResult = simnet.callPublicFn(
        "vault-stx-v2",
        "withdraw",
        [
          Cl.uint(500_000000),
          Cl.uint(490_000000),
          Cl.uint(expiredDeadline)
        ],
        user1
      );
      
      expect(withdrawResult.result).toBeErr(Cl.uint(108n)); // ERR-DEADLINE-PASSED
    });
  });

  describe("Journey 2: Multi-User Concurrent Operations", () => {
    it.skip("should handle multiple users depositing and withdrawing fairly", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      // User 1 deposits 1000 STX
      const deposit1 = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1000_000000)],
        user1
      );
      expect(deposit1.result).toBeOk(Cl.uint);

      // User 2 deposits 500 STX
      const deposit2 = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(500_000000)],
        user2
      );
      expect(deposit2.result).toBeOk(Cl.uint);
      
      // Allocate to strategy
      simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(1500_000000),
        ],
        deployer
      );
      
      // Generate yield
      simnet.mineEmptyBlocks(144);
      
      // Harvest
      const harvestResult = simnet.callPublicFn(
        "vault-stx-v2",
        "harvest-strategy",
        [Cl.principal(`${deployer}.strategy-stx-stacking`)],
        deployer
      );
      
      const yieldGenerated = Cl.uint(harvestResult.result);
      expect(Number(yieldGenerated)).toBeGreaterThan(0);
      
      // Both users withdraw - verify proportional distribution
      const user1Shares = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-balance-of",
        [Cl.principal(user1)],
        user1
      );
      
      const user2Shares = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-balance-of",
        [Cl.principal(user2)],
        user2
      );
      
      // User 1 should have ~2x shares of User 2 (1000 vs 500 deposit)
      const ratio = Number(Cl.uint(user1Shares.result)) / Number(Cl.uint(user2Shares.result));
      expect(ratio).toBeCloseTo(2.0, 0.1); // Within 10% due to dead shares
    });
  });

  describe("Journey 3: Strategy Rebalancing", () => {
    it.skip("should successfully rebalance between strategies", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      // Setup: Deposit and allocate to first strategy
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(2000_000000)],
        user1
      );
      
      simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(2000_000000),
        ],
        deployer
      );
      
      // REBALANCE: Withdraw from first strategy
      const withdrawFromStrategy = simnet.callPublicFn(
        "vault-stx-v2",
        "emergency-withdraw-from-strategy",
        [Cl.contractPrincipal(deployer, "strategy-stx-stacking"), Cl.uint(2000_000000)],
        deployer
      );
      expect(withdrawFromStrategy.result).toBeOk(Cl.bool(true));
      
      // Allocate to second strategy
      const allocateToNew = simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-zest-v1`),
          Cl.uint(1000_000000), // 50% to new strategy
        ],
        deployer
      );
      expect(allocateToNew.result).toBeOk(Cl.bool(true));
      
      // Verify assets tracked correctly
      const strategy1Assets = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-strategy-allocation",
        [Cl.principal(`${deployer}.strategy-stx-stacking`)],
        deployer
      );
      expect(strategy1Assets.result).toBeOk(Cl.uint(0n));

      const strategy2Assets = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-strategy-allocation",
        [Cl.principal(`${deployer}.strategy-zest-v1`)],
        deployer
      );
      expect(Number(Cl.uint(strategy2Assets.result))).toBeGreaterThan(0);
    });
  });

  describe("Journey 4: Emergency Scenarios", () => {
    it.skip("should handle emergency pause and resume correctly", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      // Setup: User deposits
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1000_000000)],
        user1
      );

      // EMERGENCY: Pause the vault
      const pauseResult = simnet.callPublicFn(
        "vault-stx-v2",
        "emergency-pause",
        [],
        deployer
      );
      expect(pauseResult.result).toBeOk(Cl.bool(true));

      // Verify deposits are blocked
      const blockedDeposit = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(500_000000)],
        user2
      );
      expect(blockedDeposit.result).toBeErr(Cl.uint(104n)); // ERR-PAUSED

      // Admin can still perform emergency operations (vault must be paused first)
      const emergencyWithdraw = simnet.callPublicFn(
        "vault-stx-v2",
        "emergency-withdraw-from-strategy",
        [Cl.contractPrincipal(deployer, "strategy-stx-stacking"), Cl.uint(100_000000)],
        deployer
      );
      // May fail if no funds allocated, but should not throw

      // Resume operations
      const resumeResult = simnet.callPublicFn(
        "vault-stx-v2",
        "resume",
        [],
        deployer
      );
      expect(resumeResult.result).toBeOk(Cl.bool(true));

      // Verify deposits work again
      const allowedDeposit = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(500_000000)],
        user2
      );
      expect(allowedDeposit.result).toBeOk(Cl.uint);
    });
  });

  describe("Journey 5: Performance Fee Collection", () => {
    it.skip("should correctly calculate and collect 8% performance fees", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      // Setup
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1000_000000)],
        user1
      );
      
      simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(1000_000000),
        ],
        deployer
      );
      
      // Simulate yield generation (100 STX profit)
      simnet.mineEmptyBlocks(144);
      
      const harvestResult = simnet.callPublicFn(
        "vault-stx-v2",
        "harvest-strategy",
        [Cl.principal(`${deployer}.strategy-stx-stacking`)],
        deployer
      );
      
      const profit = Number(Cl.uint(harvestResult.result));
      const expectedFee = Math.floor(profit * 0.08); // 8% of profit
      
      // Check fee was collected
      const contractBalance = simnet.getAssetsMap().get("STX")?.get(`${deployer}.vault-stx-v2`);
      
      // Verify ~8% was taken as fee
      const actualFee = profit - (Number(contractBalance) - 1000_000000);
      expect(actualFee).toBeCloseTo(expectedFee, 1000); // Within 0.001 STX due to rounding
    });
  });
});









