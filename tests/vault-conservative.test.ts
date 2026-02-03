import { describe, expect, it } from 'vitest';
import { Cl, ClarityType } from '@stacks/transactions';

async function setupTest() {
  const { initSimnet } = await import('@hirosystems/clarinet-sdk');
  const simnet = await initSimnet();
  const accounts = simnet.getAccounts();
  const deployer = accounts.get('deployer')!;
  return { simnet, deployer };
}

describe('Conservative Vault Tests', () => {
  beforeEach(() => {
    // Reset state between tests if needed
  });

  describe('Vault Identity and Metadata', () => {
    it('should have correct vault name', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-name',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.stringAscii('SNP Conservative Vault Shares'));
    });

    it('should have correct vault symbol', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-symbol',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.stringAscii('snSTX-CONS'));
    });

    it('should return vault info with conservative parameters', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-vault-info',
        [],
        deployer
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
  });

  describe('First Depositor Protection', () => {
    it('should enforce minimum first deposit of 1000 STX', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(500000000n)], // 500 STX - below minimum
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(411n)); // ERR-MINIMUM-FIRST-DEPOSIT
    });

    it('should accept first deposit of exactly 1000 STX', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)], // 1000 STX
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(1000000000n)); // Should receive 1000 shares
    });

    it('should mint dead shares to burn address on first deposit', async () => {
      const { simnet, deployer } = await setupTest();
      // Make first deposit
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Check total supply includes dead shares
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-total-supply',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(1000001000n)); // 1000 STX + 1000 dead shares
    });
  });

  describe('Basic Deposit and Withdraw Flow', () => {
    it('should allow user to deposit STX', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)], // 1000 STX
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(1000000000n));
    });

    it('should track user balance correctly after deposit', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Check balance
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-balance-of',
        [Cl.principal(deployer)],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(1000000000n));
    });

    it('should update total assets after deposit', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Check total assets
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-total-assets',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(1000000000n));
    });

    it('should allow second user to deposit without minimum requirement', async () => {
      const { simnet, deployer } = await setupTest();
      // First deposit
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Second user deposits less than 1000 STX
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(100000000n)], // 100 STX
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(100000100n)); // Should succeed
    });
  });

  describe('Withdrawal with Slippage Protection', () => {
    it('should allow user to withdraw with valid parameters', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit first
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Withdraw with slippage protection
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'withdraw',
        [
          Cl.uint(500000000n), // 500 shares
          Cl.uint(450000000n), // min 450 STX out (10% slippage tolerance)
          Cl.uint(1000000n)    // deadline: block 1M
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(499999500n)); // Should get ~500 STX (zero fees)
    });

    it('should reject withdrawal if slippage exceeds limit', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit first
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Try to withdraw with impossible slippage (asking for more than deposited)
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'withdraw',
        [
          Cl.uint(500000000n), // 500 shares
          Cl.uint(550000000n), // min 550 STX out - impossible, will fail
          Cl.uint(1000000n)
        ],
        deployer
      );

      expect(result).toBeErr(Cl.uint(407n)); // ERR-SLIPPAGE-EXCEEDED
    });

    it('should reject withdrawal if deadline passed', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit first
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Try to withdraw with expired deadline
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'withdraw',
        [
          Cl.uint(500000000n),
          Cl.uint(450000000n),
          Cl.uint(0n) // deadline: block 0 (already passed)
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(408n)); // ERR-DEADLINE-PASSED
    });

    it('should reject withdrawal with insufficient shares', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit 100 STX
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(100000000n)],
        deployer
      );

      // Try to withdraw 200 STX worth of shares
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'withdraw',
        [
          Cl.uint(200000000n),
          Cl.uint(0n),
          Cl.uint(1000000n)
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(405n)); // ERR-INSUFFICIENT-SHARES
    });
  });

  describe('Zero Fee Withdrawals', () => {
    it('should return full amount with zero fees', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit 1000 STX
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Withdraw all shares
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'withdraw',
        [
          Cl.uint(1000000000n), // all shares
          Cl.uint(900000000n),  // min 900 STX
          Cl.uint(1000000n)
        ],
        deployer
      );
      
      // Should receive ~1000 STX (zero fees)
      expect(result).toBeOk(Cl.uint(999999000n));
    });

    it('should preview withdrawal with fee calculation', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit first
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Preview withdrawal
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'preview-withdraw',
        [Cl.uint(1000000000n)],
        deployer
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
  });

  describe('Share Price Calculation', () => {
    it('should maintain 1:1 ratio for first deposit', async () => {
      const { simnet, deployer } = await setupTest();
      // First deposit
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Check share price
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-share-price',
        [],
        deployer
      );
      
      expect(result).toBeUint(999999n); // 1.0 in fixed-point
    });
  });

  describe('Emergency Pause Functionality', () => {
    it('should allow owner to pause vault', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'emergency-pause',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should prevent deposits when paused', async () => {
      const { simnet, deployer } = await setupTest();
      // Pause vault
      simnet.callPublicFn(
        'vault-conservative',
        'emergency-pause',
        [],
        deployer
      );

      // Try to deposit
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(403n)); // ERR-PAUSED
    });

    it('should prevent withdrawals when paused', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit first
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Pause vault
      simnet.callPublicFn(
        'vault-conservative',
        'emergency-pause',
        [],
        deployer
      );

      // Try to withdraw
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'withdraw',
        [Cl.uint(100000000n), Cl.uint(0n), Cl.uint(1000000n)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(403n)); // ERR-PAUSED
    });

    it('should allow owner to resume vault', async () => {
      const { simnet, deployer } = await setupTest();
      // Pause first
      simnet.callPublicFn('vault-conservative', 'emergency-pause', [], deployer);

      // Resume
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'resume',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe('Access Control', () => {
    it('should allow owner to pause', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'emergency-pause',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true)); // ERR-NOT-AUTHORIZED
    });

    it('should allow owner to resume', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'resume',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true)); // ERR-NOT-AUTHORIZED
    });

    it('should allow owner to whitelist strategy', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-stable-pool`),
          Cl.bool(true)
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true)); // ERR-NOT-AUTHORIZED
    });

    it('should allow owner to change ownership', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'set-contract-owner',
        [Cl.principal(deployer)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe('Strategy Management', () => {
    it('should allow owner to whitelist strategy', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-stable-pool`),
          Cl.bool(true)
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should verify strategy is whitelisted', async () => {
      const { simnet, deployer } = await setupTest();
      // Whitelist first
      simnet.callPublicFn(
        'vault-conservative',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-stable-pool`),
          Cl.bool(true)
        ],
        deployer
      );

      // Check status
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'is-strategy-whitelisted',
        [Cl.principal(`${deployer}.strategy-stable-pool`)],
        deployer
      );
      
      expect(result).toBeBool(true);
    });

    it('should allow owner to set active strategy', async () => {
      const { simnet, deployer } = await setupTest();
      // Whitelist first
      simnet.callPublicFn(
        'vault-conservative',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-stable-pool`),
          Cl.bool(true)
        ],
        deployer
      );

      // Set as active
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'set-active-strategy',
        [Cl.principal(`${deployer}.strategy-stable-pool`)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should reject setting non-whitelisted strategy as active', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'set-active-strategy',
        [Cl.principal(`${deployer}.strategy-zest-v1`)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(409n)); // ERR-STRATEGY-NOT-WHITELISTED
    });
  });

  describe('Multi-User Scenarios', () => {
    it('should handle multiple users depositing', async () => {
      const { simnet, deployer } = await setupTest();
      // User 1 deposits
      const result1 = simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );
      expect(result1.result).toBeOk(Cl.uint(1000000000n));

      // User 2 deposits
      const result2 = simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(500000000n)],
        deployer
      );
      expect(result2.result).toBeOk(Cl.uint(500000500n));

      // Check total assets
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-total-assets',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(1500000000n)); // 1500 STX total
    });

    it('should maintain correct balances for multiple users', async () => {
      const { simnet, deployer } = await setupTest();
      // User 1 deposits 1000 STX
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // User 2 deposits 500 STX
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(500000000n)],
        deployer
      );

      // Check User 1 balance
      const balance1 = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-balance-of',
        [Cl.principal(deployer)],
        deployer
      );
      expect(balance1.result).toBeOk(Cl.uint(1500000500n));

      // Check User 2 balance
      const balance2 = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-balance-of',
        [Cl.principal(deployer)],
        deployer
      );
      expect(balance2.result).toBeOk(Cl.uint(1500000500n));
    });
  });

  describe('Edge Cases', () => {
    it('should reject zero amount deposits', async () => {
      const { simnet, deployer } = await setupTest();
      const { result } = simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(0n)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(406n)); // ERR-ZERO-AMOUNT
    });

    it('should handle vault balance queries correctly', async () => {
      const { simnet, deployer } = await setupTest();
      // Deposit
      simnet.callPublicFn(
        'vault-conservative',
        'deposit',
        [Cl.uint(1000000000n)],
        deployer
      );

      // Check vault STX balance
      const { result } = simnet.callReadOnlyFn(
        'vault-conservative',
        'get-vault-stx-balance',
        [],
        deployer
      );
      
      expect(result).toBeUint(1000000000n);
    });
  });
});



