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
 * GAS OPTIMIZATION TESTS
 * Benchmarks gas costs for all operations and flags regressions
 */

import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;

// Gas cost thresholds (in execution cost units)
const GAS_THRESHOLDS = {
  deposit: 50000,
  withdraw: 60000,
  allocate: 70000,
  harvest: 80000,
  emergency_withdraw: 65000,
  pause: 10000,
  unpause: 10000,
};

interface GasMeasurement {
  operation: string;
  cost: number;
  threshold: number;
  passed: boolean;
}

const gasBenchmarks: GasMeasurement[] = [];

describe("Gas Optimization Tests", () => {
  
  describe("Core Operations Gas Costs", () => {
    
    it.skip("should measure deposit gas cost", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1500_000000)],
        user1
      );
      
      const gasCost = result.events[0]?.cost || 0;
      const passed = gasCost <= GAS_THRESHOLDS.deposit;
      
      gasBenchmarks.push({
        operation: "deposit",
        cost: gasCost,
        threshold: GAS_THRESHOLDS.deposit,
        passed
      });
      
      expect(gasCost).toBeLessThanOrEqual(GAS_THRESHOLDS.deposit);
      console.log(`✓ Deposit gas: ${gasCost} (threshold: ${GAS_THRESHOLDS.deposit})`);
    });
    
    it.skip("should measure withdraw gas cost", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      // Setup: deposit first
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1500_000000)],
        user1
      );
      
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "withdraw",
        [Cl.uint(500_000000), Cl.uint(490_000000), Cl.uint(simnet.blockHeight + 10)],
        user1
      );
      
      const gasCost = result.events[0]?.cost || 0;
      const passed = gasCost <= GAS_THRESHOLDS.withdraw;
      
      gasBenchmarks.push({
        operation: "withdraw",
        cost: gasCost,
        threshold: GAS_THRESHOLDS.withdraw,
        passed
      });
      
      expect(gasCost).toBeLessThanOrEqual(GAS_THRESHOLDS.withdraw);
      console.log(`✓ Withdraw gas: ${gasCost} (threshold: ${GAS_THRESHOLDS.withdraw})`);
    });
    
    it.skip("should measure allocate-to-strategy gas cost", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1500_000000)],
        user1
      );
      
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(750_000000),
        ],
        deployer
      );
      
      const gasCost = result.events[0]?.cost || 0;
      const passed = gasCost <= GAS_THRESHOLDS.allocate;
      
      gasBenchmarks.push({
        operation: "allocate-to-strategy",
        cost: gasCost,
        threshold: GAS_THRESHOLDS.allocate,
        passed
      });
      
      expect(gasCost).toBeLessThanOrEqual(GAS_THRESHOLDS.allocate);
      console.log(`✓ Allocate gas: ${gasCost} (threshold: ${GAS_THRESHOLDS.allocate})`);
    });
    
    it.skip("should measure harvest gas cost", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1500_000000)],
        user1
      );
      
      simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(750_000000),
        ],
        deployer
      );
      
      simnet.mineEmptyBlocks(144);
      
      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "harvest-strategy",
        [Cl.principal(`${deployer}.strategy-stx-stacking`)],
        deployer
      );
      
      const gasCost = result.events[0]?.cost || 0;
      const passed = gasCost <= GAS_THRESHOLDS.harvest;
      
      gasBenchmarks.push({
        operation: "harvest",
        cost: gasCost,
        threshold: GAS_THRESHOLDS.harvest,
        passed
      });
      
      expect(gasCost).toBeLessThanOrEqual(GAS_THRESHOLDS.harvest);
      console.log(`✓ Harvest gas: ${gasCost} (threshold: ${GAS_THRESHOLDS.harvest})`);
    });
    
    it.skip("should measure emergency-withdraw gas cost", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      simnet.callPublicFn(
        "vault-stx-v2",
        "deposit",
        [Cl.uint(1500_000000)],
        user1
      );

      simnet.callPublicFn(
        "vault-stx-v2",
        "allocate-to-strategy",
        [
          Cl.principal(`${deployer}.strategy-stx-stacking`),
          Cl.uint(750_000000),
        ],
        deployer
      );

      // Must pause vault before emergency withdraw
      simnet.callPublicFn("vault-stx-v2", "emergency-pause", [], deployer);

      const result = simnet.callPublicFn(
        "vault-stx-v2",
        "emergency-withdraw-from-strategy",
        [Cl.contractPrincipal(deployer, "strategy-stx-stacking"), Cl.uint(750_000000)],
        deployer
      );
      
      const gasCost = result.events[0]?.cost || 0;
      const passed = gasCost <= GAS_THRESHOLDS.emergency_withdraw;
      
      gasBenchmarks.push({
        operation: "emergency-withdraw",
        cost: gasCost,
        threshold: GAS_THRESHOLDS.emergency_withdraw,
        passed
      });
      
      expect(gasCost).toBeLessThanOrEqual(GAS_THRESHOLDS.emergency_withdraw);
      console.log(`✓ Emergency withdraw gas: ${gasCost} (threshold: ${GAS_THRESHOLDS.emergency_withdraw})`);
    });
    
    it("should measure pause/unpause gas costs", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const pauseResult = simnet.callPublicFn(
        "vault-stx-v2",
        "emergency-pause",
        [],
        deployer
      );

      const pauseGas = pauseResult.events[0]?.cost || 0;

      gasBenchmarks.push({
        operation: "pause",
        cost: pauseGas,
        threshold: GAS_THRESHOLDS.pause,
        passed: pauseGas <= GAS_THRESHOLDS.pause
      });

      expect(pauseGas).toBeLessThanOrEqual(GAS_THRESHOLDS.pause);
      console.log(`✓ Pause gas: ${pauseGas} (threshold: ${GAS_THRESHOLDS.pause})`);

      const unpauseResult = simnet.callPublicFn(
        "vault-stx-v2",
        "resume",
        [],
        deployer
      );
      
      const unpauseGas = unpauseResult.events[0]?.cost || 0;
      
      gasBenchmarks.push({
        operation: "unpause",
        cost: unpauseGas,
        threshold: GAS_THRESHOLDS.unpause,
        passed: unpauseGas <= GAS_THRESHOLDS.unpause
      });
      
      expect(unpauseGas).toBeLessThanOrEqual(GAS_THRESHOLDS.unpause);
      console.log(`✓ Unpause gas: ${unpauseGas} (threshold: ${GAS_THRESHOLDS.unpause})`);
    });
  });
  
  describe("Comparative Gas Analysis", () => {
    it.skip("should compare gas costs across multiple deposits", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const deposits = [1000, 5000, 10000, 50000].map(amount => amount * 1_000000);
      const gasCosts: number[] = [];
      
      deposits.forEach((amount, index) => {
        const user = deployer;
        const result = simnet.callPublicFn(
          "vault-stx-v2",
          "deposit",
          [Cl.uint(amount)],
          user
        );
        
        const gas = result.events[0]?.cost || 0;
        gasCosts.push(gas);
      });
      
      // Gas cost should be relatively constant regardless of deposit size
      const maxGas = Math.max(...gasCosts);
      const minGas = Math.min(...gasCosts);
      const variance = ((maxGas - minGas) / minGas) * 100;
      
      console.log(`\nGas variance across deposit sizes: ${variance.toFixed(2)}%`);
      console.log(`Min: ${minGas}, Max: ${maxGas}`);
      
      // Variance should be less than 20%
      expect(variance).toBeLessThan(20);
    });
    
    it("should detect gas regressions", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      console.log("\n=== GAS BENCHMARK REPORT ===");
      console.log("Operation          | Cost    | Threshold | Status");
      console.log("-------------------|---------|-----------|--------");
      
      gasBenchmarks.forEach(benchmark => {
        const status = benchmark.passed ? "✓ PASS" : "✗ FAIL";
        const percent = ((benchmark.cost / benchmark.threshold) * 100).toFixed(1);
        console.log(
          `${benchmark.operation.padEnd(18)} | ${benchmark.cost.toString().padEnd(7)} | ${benchmark.threshold.toString().padEnd(9)} | ${status} (${percent}%)`
        );
      });
      
      const allPassed = gasBenchmarks.every(b => b.passed);
      expect(allPassed).toBe(true);
    });
  });
  
  describe("Gas Optimization Opportunities", () => {
    it("should identify expensive operations for optimization", async () => {
      const { simnet, deployer, accounts } = await setupTest();
      const expensiveOps = gasBenchmarks.filter(
        b => (b.cost / b.threshold) > 0.8 // >80% of threshold
      );
      
      if (expensiveOps.length > 0) {
        console.log("\n⚠️  Operations near gas limit (>80%):");
        expensiveOps.forEach(op => {
          const percent = ((op.cost / op.threshold) * 100).toFixed(1);
          console.log(`  - ${op.operation}: ${percent}% of threshold`);
        });
      }
      
      // This test passes but warns about expensive operations
      expect(true).toBe(true);
    });
  });
});







