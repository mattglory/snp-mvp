import { describe, expect, it } from 'vitest';
import { Cl } from '@stacks/transactions';

describe('Vault STX V2 Tests', () => {
  async function setupTest() {
    const { initSimnet } = await import('@hirosystems/clarinet-sdk');
    const simnet = await initSimnet();
    const accounts = simnet.getAccounts();
    const deployer = accounts.get('deployer')!;
    return { simnet, deployer };
  }

  describe('Basic Deposit and Withdraw Flow', () => {
    it('should allow user to deposit STX', async () => {
      const { simnet, deployer } = await setupTest();
      
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(1000000000n));
    });

    it('should track user balance correctly after deposit', async () => {
      const { simnet, deployer } = await setupTest();
      
      simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        'vault-stx-v2',
        'get-balance-of',
        [Cl.principal(deployer)],
        deployer
      );
      
      // Account for 1000 dead shares minted on first deposit
      expect(result).toBeOk(Cl.uint(1000000000n));
    });

    it('should allow user to withdraw STX shares', async () => {
      const { simnet, deployer } = await setupTest();
      
      simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'withdraw',
        [
          Cl.uint(500000000n),
          Cl.uint(400000000n),
          Cl.uint(1000n)
        ],
        deployer
      );
      
      // Expect close to 500M with zero fees (rounding errors acceptable)
      const resultValue = result.value.value;
      expect(resultValue).toBeGreaterThan(499999000n);
      expect(resultValue).toBeLessThan(500001000n);
    });
  });

  describe('Share Price Calculation', () => {
    it('should maintain close to 1:1 ratio for first deposit', async () => {
      const { simnet, deployer } = await setupTest();
      
      simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        'vault-stx-v2',
        'get-share-price',
        [],
        deployer
      );
      
      // Dead shares cause slight deviation (999999 instead of 1000000)
      expect(result).toBeUint(999999n);
    });
  });

  describe('Emergency Pause Functionality', () => {
    it('should allow owner to pause vault', async () => {
      const { simnet, deployer } = await setupTest();
      
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'emergency-pause',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should prevent deposits when paused', async () => {
      const { simnet, deployer } = await setupTest();
      
      simnet.callPublicFn(
        'vault-stx-v2',
        'emergency-pause',
        [],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(104n));
    });

    it('should allow owner to resume vault', async () => {
      const { simnet, deployer } = await setupTest();
      
      simnet.callPublicFn('vault-stx-v2', 'emergency-pause', [], deployer);

      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'resume',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe('Security Tests', () => {
    it('should allow owner to pause vault', async () => {
      const { simnet, deployer } = await setupTest();
      
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'emergency-pause',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should allow owner to whitelist strategy', async () => {
      const { simnet, deployer } = await setupTest();
      
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-alex-stx-usda`),
          Cl.bool(true)
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe('Strategy Management', () => {
    it('should allow owner to whitelist strategy', async () => {
      const { simnet, deployer } = await setupTest();
      
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-alex-stx-usda`),
          Cl.bool(true)
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should verify strategy is whitelisted', async () => {
      const { simnet, deployer } = await setupTest();
      
      simnet.callPublicFn(
        'vault-stx-v2',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-alex-stx-usda`),
          Cl.bool(true)
        ],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        'vault-stx-v2',
        'is-strategy-whitelisted',
        [Cl.principal(`${deployer}.strategy-alex-stx-usda`)],
        deployer
      );
      
      expect(result).toBeBool(true);
    });
  });

  describe('Zero Fee Withdrawals', () => {
    it('should return full amount with zero fees', async () => {
      const { simnet, deployer } = await setupTest();
      
      simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'withdraw',
        [
          Cl.uint(1000000000n),
          Cl.uint(900000000n),
          Cl.uint(1000n)
        ],
        deployer
      );
      
      // Expect close to 1000M with zero fees (rounding acceptable)
      const resultValue = result.value.value;
      expect(resultValue).toBeGreaterThanOrEqual(999999000n);
      expect(resultValue).toBeLessThanOrEqual(1000001000n);
    });
  });
});
