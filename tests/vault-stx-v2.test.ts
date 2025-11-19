import { describe, expect, it, beforeAll } from 'vitest';
import { Cl } from '@stacks/transactions';

// This will be initialized in beforeAll
let simnet: any;
let accounts: Map<string, string>;
let deployer: string;
let wallet1: string;
let wallet2: string;
let wallet3: string;

describe('Vault STX V2 Tests', () => {
  beforeAll(async () => {
    // Import and initialize simnet
    const { initSimnet } = await import('@hirosystems/clarinet-sdk');
    simnet = await initSimnet();
    
    // Get accounts
    accounts = simnet.getAccounts();
    deployer = accounts.get('deployer')!;
    wallet1 = accounts.get('wallet_1')!;
    wallet2 = accounts.get('wallet_2')!;
    wallet3 = accounts.get('wallet_3')!;
  }, 60000); // Increase timeout to 60 seconds

  describe('Basic Deposit and Withdraw Flow', () => {
    it('should allow user to deposit STX', () => {
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000)], // 1000 STX in micro-STX
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(1000000000)); // Should receive 1000 shares
    });

    it('should track user balance correctly after deposit', () => {
      // Deposit first
      simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Check balance
      const { result } = simnet.callReadOnlyFn(
        'vault-stx-v2',
        'get-balance-of',
        [Cl.principal(wallet1)],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(1000000000));
    });

    it('should allow user to withdraw STX shares', () => {
      // Deposit first
      simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Withdraw 500 STX worth of shares
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'withdraw',
        [Cl.uint(500000000)],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(500000000));
    });
  });

  describe('Share Price Calculation', () => {
    it('should maintain 1:1 ratio for first deposit', () => {
      // First deposit
      simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Check share price (should be 1.0 = 1000000 in fixed point)
      const { result } = simnet.callReadOnlyFn(
        'vault-stx-v2',
        'get-share-price',
        [],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(1000000));
    });
  });

  describe('Emergency Pause Functionality', () => {
    it('should allow owner to pause vault', () => {
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'emergency-pause',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should prevent deposits when paused', () => {
      // Pause vault
      simnet.callPublicFn(
        'vault-stx-v2',
        'emergency-pause',
        [],
        deployer
      );

      // Try to deposit while paused
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(104)); // ERR-PAUSED
    });

    it('should allow owner to resume vault', () => {
      // Pause first
      simnet.callPublicFn('vault-stx-v2', 'emergency-pause', [], deployer);

      // Resume
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
    it('should reject non-owner attempting to pause vault', () => {
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'emergency-pause',
        [],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it('should reject non-owner attempting to whitelist strategy', () => {
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-alex-stx-usda`),
          Cl.bool(true)
        ],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
  });

  describe('Strategy Management', () => {
    it('should allow owner to whitelist strategy', () => {
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

    it('should verify strategy is whitelisted', () => {
      // Whitelist first
      simnet.callPublicFn(
        'vault-stx-v2',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-alex-stx-usda`),
          Cl.bool(true)
        ],
        deployer
      );

      // Check whitelist status
      const { result } = simnet.callReadOnlyFn(
        'vault-stx-v2',
        'is-strategy-whitelisted',
        [Cl.principal(`${deployer}.strategy-alex-stx-usda`)],
        deployer
      );
      
      expect(result).toBeBool(true);
    });
  });

  describe('Fee Collection', () => {
    it('should charge withdrawal fee correctly', () => {
      // Deposit
      simnet.callPublicFn(
        'vault-stx-v2',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Withdraw (should charge 0.5% fee = 5000000 micro-STX)
      const { result } = simnet.callPublicFn(
        'vault-stx-v2',
        'withdraw',
        [Cl.uint(1000000000)],
        wallet1
      );
      
      // User should receive 995000000 (99.5% of 1000 STX)
      expect(result).toBeOk(Cl.uint(995000000));
    });
  });
});
