import { describe, expect, it, beforeAll } from 'vitest';
import { Cl } from '@stacks/transactions';

// This will be initialized in beforeAll
let simnet: any;
let accounts: Map<string, string>;
let deployer: string;
let wallet1: string;
let wallet2: string;
let wallet3: string;

describe('Growth Vault Tests', () => {
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

  describe('Vault Identity and Metadata', () => {
    it('should have correct vault name', () => {
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'get-name',
        [],
        wallet1
      );
      
      expect(result).toBeOk(Cl.stringAscii('SNP Growth Vault Shares'));
    });

    it('should have correct vault symbol', () => {
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'get-symbol',
        [],
        wallet1
      );
      
      expect(result).toBeOk(Cl.stringAscii('snSTX-GRTH'));
    });

    it('should return vault info with growth parameters', () => {
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'get-vault-info',
        [],
        wallet1
      );
      
      expect(result).toBeOk(Cl.tuple({
        name: Cl.stringAscii('SNP Growth Vault'),
        symbol: Cl.stringAscii('snSTX-GRTH'),
        'target-apy': Cl.stringAscii('18-25%'),
        'risk-score': Cl.uint(4),
        'total-assets': Cl.uint(0),
        'total-supply': Cl.uint(0),
        'share-price': Cl.uint(1000000),
        'strategy-focus': Cl.stringAscii('Maximum yields, higher risk tolerance'),
        initialized: Cl.bool(false),
        paused: Cl.bool(false)
      }));
    });
  });

  describe('First Depositor Protection', () => {
    it('should enforce minimum first deposit of 1000 STX', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(500000000)], // 500 STX - below minimum
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(411)); // ERR-MINIMUM-FIRST-DEPOSIT
    });

    it('should accept first deposit of exactly 1000 STX', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)], // 1000 STX
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(1000000000)); // Should receive 1000 shares
    });

    it('should mint dead shares to burn address on first deposit', () => {
      // Make first deposit
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Check total supply includes dead shares
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'get-total-supply',
        [],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(1000001000)); // 1000 STX + 1000 dead shares
    });
  });

  describe('Basic Deposit and Withdraw Flow', () => {
    it('should allow user to deposit STX', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)], // 1000 STX
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(1000000000));
    });

    it('should track user balance correctly after deposit', () => {
      // Deposit
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Check balance
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'get-balance',
        [Cl.principal(wallet1)],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(1000000000));
    });

    it('should update total assets after deposit', () => {
      // Deposit
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Check total assets
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'get-total-assets',
        [],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(1000000000));
    });

    it('should allow second user to deposit without minimum requirement', () => {
      // First deposit
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Second user deposits less than 1000 STX
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(100000000)], // 100 STX
        wallet2
      );
      
      expect(result).toBeOk(Cl.uint(100000000)); // Should succeed
    });
  });

  describe('Withdrawal with Slippage Protection', () => {
    it('should allow user to withdraw with valid parameters', () => {
      // Deposit first
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Withdraw with slippage protection
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'withdraw',
        [
          Cl.uint(500000000), // 500 shares
          Cl.uint(450000000), // min 450 STX out (10% slippage tolerance)
          Cl.uint(1000000)    // deadline: block 1M
        ],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(460000000)); // Should get ~460 STX (500 - 8% fee)
    });

    it('should reject withdrawal if slippage exceeds limit', () => {
      // Deposit first
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Try to withdraw with tight slippage
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'withdraw',
        [
          Cl.uint(500000000), // 500 shares
          Cl.uint(495000000), // min 495 STX out - too high, will fail
          Cl.uint(1000000)
        ],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(407)); // ERR-SLIPPAGE-EXCEEDED
    });

    it('should reject withdrawal if deadline passed', () => {
      // Deposit first
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Try to withdraw with expired deadline
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'withdraw',
        [
          Cl.uint(500000000),
          Cl.uint(450000000),
          Cl.uint(0) // deadline: block 0 (already passed)
        ],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(408)); // ERR-DEADLINE-PASSED
    });

    it('should reject withdrawal with insufficient shares', () => {
      // Deposit 100 STX
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(100000000)],
        wallet1
      );

      // Try to withdraw 200 STX worth of shares
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'withdraw',
        [
          Cl.uint(200000000),
          Cl.uint(0),
          Cl.uint(1000000)
        ],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(405)); // ERR-INSUFFICIENT-SHARES
    });
  });

  describe('Performance Fee (8%)', () => {
    it('should charge 8% performance fee on withdrawals', () => {
      // Deposit 1000 STX
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Withdraw all shares
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'withdraw',
        [
          Cl.uint(1000000000), // all shares
          Cl.uint(900000000),  // min 900 STX
          Cl.uint(1000000)
        ],
        wallet1
      );
      
      // Should receive 920 STX (1000 - 8% = 920)
      expect(result).toBeOk(Cl.uint(920000000));
    });

    it('should preview withdrawal with fee calculation', () => {
      // Deposit first
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Preview withdrawal
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'preview-withdraw',
        [Cl.uint(1000000000)],
        wallet1
      );
      
      expect(result).toBeOk(Cl.tuple({
        'gross-amount': Cl.uint(1000000000),
        fee: Cl.uint(80000000),      // 8% fee
        'net-amount': Cl.uint(920000000),
        'current-block': Cl.uint(2)
      }));
    });
  });

  describe('Share Price Calculation', () => {
    it('should maintain 1:1 ratio for first deposit', () => {
      // First deposit
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Check share price
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'get-share-price',
        [],
        wallet1
      );
      
      expect(result).toBe(Cl.uint(1000000)); // 1.0 in fixed-point
    });
  });

  describe('Emergency Pause Functionality', () => {
    it('should allow owner to pause vault', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'emergency-pause',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should prevent deposits when paused', () => {
      // Pause vault
      simnet.callPublicFn(
        'vault-growth',
        'emergency-pause',
        [],
        deployer
      );

      // Try to deposit
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(403)); // ERR-PAUSED
    });

    it('should prevent withdrawals when paused', () => {
      // Deposit first
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Pause vault
      simnet.callPublicFn(
        'vault-growth',
        'emergency-pause',
        [],
        deployer
      );

      // Try to withdraw
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'withdraw',
        [Cl.uint(100000000), Cl.uint(0), Cl.uint(1000000)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(403)); // ERR-PAUSED
    });

    it('should allow owner to resume vault', () => {
      // Pause first
      simnet.callPublicFn('vault-growth', 'emergency-pause', [], deployer);

      // Resume
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'resume',
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe('Access Control', () => {
    it('should reject non-owner attempting to pause', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'emergency-pause',
        [],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(401)); // ERR-NOT-AUTHORIZED
    });

    it('should reject non-owner attempting to resume', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'resume',
        [],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(401)); // ERR-NOT-AUTHORIZED
    });

    it('should reject non-owner attempting to whitelist strategy', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-bitflow-v1`),
          Cl.bool(true)
        ],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(401)); // ERR-NOT-AUTHORIZED
    });

    it('should allow owner to change ownership', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'set-contract-owner',
        [Cl.principal(wallet2)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe('Strategy Management', () => {
    it('should allow owner to whitelist high-yield strategy', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-bitflow-v1`),
          Cl.bool(true)
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should verify strategy is whitelisted', () => {
      // Whitelist first
      simnet.callPublicFn(
        'vault-growth',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-bitflow-v1`),
          Cl.bool(true)
        ],
        deployer
      );

      // Check status
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'is-strategy-whitelisted',
        [Cl.principal(`${deployer}.strategy-bitflow-v1`)],
        deployer
      );
      
      expect(result).toBeBool(true);
    });

    it('should allow owner to set active strategy', () => {
      // Whitelist first
      simnet.callPublicFn(
        'vault-growth',
        'whitelist-strategy',
        [
          Cl.principal(`${deployer}.strategy-bitflow-v1`),
          Cl.bool(true)
        ],
        deployer
      );

      // Set as active
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'set-active-strategy',
        [Cl.principal(`${deployer}.strategy-bitflow-v1`)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should reject setting non-whitelisted strategy as active', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'set-active-strategy',
        [Cl.principal(`${deployer}.strategy-zest-v1`)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(409)); // ERR-STRATEGY-NOT-WHITELISTED
    });
  });

  describe('Multi-User Scenarios', () => {
    it('should handle multiple users depositing', () => {
      // User 1 deposits
      const result1 = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );
      expect(result1.result).toBeOk(Cl.uint(1000000000));

      // User 2 deposits
      const result2 = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(500000000)],
        wallet2
      );
      expect(result2.result).toBeOk(Cl.uint(500000000));

      // Check total assets
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'get-total-assets',
        [],
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(1500000000)); // 1500 STX total
    });

    it('should maintain correct balances for multiple users', () => {
      // User 1 deposits 1000 STX
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // User 2 deposits 500 STX
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(500000000)],
        wallet2
      );

      // Check User 1 balance
      const balance1 = simnet.callReadOnlyFn(
        'vault-growth',
        'get-balance',
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(balance1.result).toBeOk(Cl.uint(1000000000));

      // Check User 2 balance
      const balance2 = simnet.callReadOnlyFn(
        'vault-growth',
        'get-balance',
        [Cl.principal(wallet2)],
        wallet2
      );
      expect(balance2.result).toBeOk(Cl.uint(500000000));
    });
  });

  describe('High-Risk Tolerance Scenarios', () => {
    it('should accept larger deposits for growth-seeking users', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(5000000000)], // 5000 STX
        wallet1
      );
      
      expect(result).toBeOk(Cl.uint(5000000000));
    });

    it('should handle rapid deposit/withdraw cycles', () => {
      // Deposit
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Immediate partial withdrawal
      const result1 = simnet.callPublicFn(
        'vault-growth',
        'withdraw',
        [Cl.uint(500000000), Cl.uint(0), Cl.uint(1000000)],
        wallet1
      );
      expect(result1.result).toBeOk(Cl.uint(460000000));

      // Re-deposit
      const result2 = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(200000000)],
        wallet1
      );
      expect(result2.result).toBeOk(Cl.uint(200000000));
    });
  });

  describe('Edge Cases', () => {
    it('should reject zero amount deposits', () => {
      const { result } = simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(0)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(406)); // ERR-ZERO-AMOUNT
    });

    it('should handle vault balance queries correctly', () => {
      // Deposit
      simnet.callPublicFn(
        'vault-growth',
        'deposit',
        [Cl.uint(1000000000)],
        wallet1
      );

      // Check vault STX balance
      const { result } = simnet.callReadOnlyFn(
        'vault-growth',
        'get-vault-stx-balance',
        [],
        wallet1
      );
      
      expect(result).toBe(Cl.uint(1000000000));
    });
  });
});
