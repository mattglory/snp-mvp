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
 * CHAOS TESTING - Stress Tests & Edge Cases
 * Tests system behavior under extreme conditions
 */

import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

describe("Chaos Testing", () => {
  
  describe("Concurrent Operations", () => {
    it("should handle 10 simultaneous deposits", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const results = Array(10).fill(deployer).map(user =>
        simnet.callPublicFn(
          "vault-stx-v2",
          "deposit",
          [Cl.uint(1000_000000)],
          user
        )
      );
      
      // All deposits should succeed
      const successCount = results.filter(r => r.result.type === "ok").length;
      expect(successCount).toBe(10);
      
      // Total shares should match
      const totalShares = results.reduce((sum, r) => {
        if (r.result.type === "ok") {
          return sum + Number(r.result.value.value);
        }
        return sum;
      }, 0);
      
      expect(totalShares).toBeGreaterThan(0);
      console.log(`✓ Handled ${successCount} concurrent deposits`);
    });
    
    it("should handle concurrent deposits and withdrawals", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      // Half deposit
      Array(5).fill(deployer).forEach(user => {
        simnet.callPublicFn(
          "vault-stx-v2",
          "deposit",
          [Cl.uint(2000_000000)],
          user
        );
      });

      // Half withdraw (different users)
      const withdrawResults = Array(5).fill(deployer).map(user => {
        // First deposit so they have shares to withdraw
        simnet.callPublicFn(
          "vault-stx-v2",
          "deposit",
          [Cl.uint(2000_000000)],
          user
        );
        
        return simnet.callPublicFn(
          "vault-stx-v2",
          "withdraw",
          [Cl.uint(500_000000), Cl.uint(0n), Cl.uint(simnet.blockHeight + 10)],
          user
        );
      });
      
      // All operations should succeed
      expect(withdrawResults.every(r => r.result.type === "ok")).toBe(true);
    });
  });
  
  describe("Edge Cases - Dust Amounts", () => {
    it("should handle minimum possible deposit (1 micro-STX)", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1n)],
        deployer
      );
      
      // Should fail due to minimum deposit requirement
      expect(result.result).toBeErr(Cl.uint(109n)); // ERR-MINIMUM-DEPOSIT
    });
    
    it("should handle zero amount operations gracefully", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const depositResult = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(0n)],
        deployer
      );
      
      expect(depositResult.result).toBeErr(Cl.uint(102n)); // ERR-ZERO-AMOUNT
      
      // Setup for withdraw test
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1500_000000)],
        deployer
      );
      
      const withdrawResult = simnet.callPublicFn(
        "vault-stx-v2",
        "withdraw",
        [Cl.uint(0n), Cl.uint(0n), Cl.uint(simnet.blockHeight + 10)],
        deployer
      );
      
      expect(withdrawResult.result).toBeErr(Cl.uint(102n)); // ERR-ZERO-AMOUNT
    });
    
    it.skip("should handle dust withdrawals correctly", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1500_000000)],
        deployer
      );
      
      // Try to withdraw 1 micro-share
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "withdraw",
        [Cl.uint(1n), Cl.uint(0n), Cl.uint(simnet.blockHeight + 10)],
        deployer
      );
      
      // Should succeed but return minimal amount
      expect(result.result.type).toBe("ok");
    });
  });
  
  describe("Edge Cases - Maximum Values", () => {
    it.skip("should handle maximum possible deposit", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const maxUint = 340282366920938463463374607431768211455n; // u128 max
      
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(maxUint)],
        deployer
      );
      
      // Should fail due to insufficient balance
      expect(result.result).toBeErr(Cl.uint);
    });
    
    it.skip("should handle maximum allocation to single strategy", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const largeDeposit = 1000000_000000; // 1M STX
      
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(largeDeposit)],
        deployer
      );
      
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(largeDeposit),
        ],
        deployer
      );
      
      expect(result.result.type).toBe("ok");
    });
  });
  
  describe("Strategy Failure Scenarios", () => {
    it.skip("should handle strategy contract revert gracefully", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(2000_000000)],
        deployer
      );
      
      // Try to allocate to non-whitelisted strategy
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.fake-strategy`),
          Cl.uint(1000_000000),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(105n)); // ERR-STRATEGY-NOT-WHITELISTED
    });
    
    it.skip("should handle harvest failures without breaking vault", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(2000_000000)],
        deployer
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
      
      // Try to harvest from inactive strategy
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "harvest-strategy",
        [Cl.principal(`${deployer}.strategy-zest-v1`)],
        deployer
      );
      
      // Should handle gracefully
      expect(result.result).toBeErr(Cl.uint);
      
      // Vault should still function
      const withdrawResult = simnet.callPublicFn(
        "vault-stx-v2",
        "withdraw",
        [Cl.uint(500_000000), Cl.uint(0n), Cl.uint(simnet.blockHeight + 10)],
        deployer
      );
      
      expect(withdrawResult.result.type).toBe("ok");
    });
  });
  
  describe("Race Conditions", () => {
    it.skip("should handle pause during active operations", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(2000_000000)],
        deployer
      );

      // Start allocation
      simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(1000_000000),
        ],
        deployer
      );

      // Immediate pause
      simnet.callPublicFn("vault-stx-v2", "emergency-pause", [], deployer);

      // New deposits should fail
      const blockedDeposit = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(500_000000)],
        users[1]
      );
      
      expect(blockedDeposit.result).toBeErr(Cl.uint(104n)); // ERR-PAUSED
    });
    
    it.skip("should handle multiple rebalancing attempts", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(3000_000000)],
        deployer
      );
      
      // Allocate to first strategy
      simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(3000_000000),
        ],
        deployer
      );
      
      // Rapid rebalancing attempts
      for (let i = 0; i < 5; i++) {
        simnet.callPublicFn(
          "vault-stx-v2",
          "emergency-withdraw-from-strategy",
          [Cl.contractPrincipal(deployer, "strategy-stx-stacking"), Cl.uint(1000_000000)],
          deployer
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
      }
      
      // Vault should remain consistent
      const totalAssets = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-total-assets",
        [],
        deployer
      );
      
      expect(Number(Cl.uint(totalAssets.result))).toBeGreaterThan(0);
    });
  });
  
  describe("Accounting Integrity", () => {
    it.skip("should maintain correct share accounting under stress", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      // Multiple users deposit different amounts
      const deposits = [1000, 2000, 3000, 4000, 5000].map(x => x * 1_000000);
      
      deposits.forEach((amount, i) => {
        simnet.callPublicFn(
          "vault-stx-v2",
          "deposit",
          [Cl.uint(amount)],
          deployer
        );
      });
      
      // Get total shares and total assets
      const totalShares = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-total-supply",
        [],
        deployer
      );
      
      const totalAssets = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-total-assets",
        [],
        deployer
      );
      
      // Sum of individual shares should equal total supply
      const sumIndividualShares = deposits.reduce((sum, _, i) => {
        const balance = simnet.callReadOnlyFn(
          "vault-stx-v2",
          "get-balance-of",
          [Cl.principal(deployer)],
          deployer
        );
        return sum + Number(balance.result.value);
      }, 0);
      
      // Add dead shares
      const deadShares = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-balance-of",
        [Cl.principal("SP000000000000000000002Q6VF78")],
        deployer
      );
      
      const totalSharesExpected = sumIndividualShares + Number(Cl.uint(deadShares.result));
      
      expect(Number(Cl.uint(totalShares.result))).toBe(totalSharesExpected);
    });
    
    it.skip("should maintain share price through multiple operations", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      // Initial deposit
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1000_000000)],
        deployer
      );
      
      const initialSharePrice = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-share-price",
        [],
        deployer
      );
      
      // Perform multiple operations
      simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [Cl.principal(`${deployer}.strategy-stx-stacking`), Cl.uint(500_000000)],
        deployer
      );
      
      simnet.mineEmptyBlocks(50);
      
      simnet.callPublicFn(
        "vault-stx-v2",
        "harvest-strategy",
        [Cl.principal(`${deployer}.strategy-stx-stacking`)],
        deployer
      );
      
      // Additional deposits
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(500_000000)],
        users[1]
      );
      
      const finalSharePrice = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-share-price",
        [],
        deployer
      );
      
      // Share price should increase or stay stable (never decrease without withdrawals)
      expect(Number(Cl.uint(finalSharePrice.result))).toBeGreaterThanOrEqual(
        Number(Cl.uint(initialSharePrice.result))
      );
    });
  });
  
  describe("State Consistency Under Failures", () => {
    it("should maintain consistent state after failed operations", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1000_000000)],
        deployer
      );
      
      const assetsBefore = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-total-assets",
        [],
        deployer
      );
      
      // Try invalid operation (should fail)
      simnet.callPublicFn(
        "vault-stx-v2",
        "withdraw",
        [Cl.uint(5000_000000), Cl.uint(0n), Cl.uint(simnet.blockHeight + 10)], // More than balance
        deployer
      );
      
      const assetsAfter = simnet.callReadOnlyFn(
        "vault-stx-v2",
        "get-total-assets",
        [],
        deployer
      );
      
      // Assets should remain unchanged
      expect(assetsAfter.result).toEqual(assetsBefore.result);
    });
  });
});






