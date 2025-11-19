import { describe, expect, it, beforeAll } from 'vitest';
import { Cl } from '@stacks/transactions';

let simnet: any;
let deployer: string;

describe('Setup and Environment Tests', () => {
  beforeAll(async () => {
    const { initSimnet } = await import('@hirosystems/clarinet-sdk');
    simnet = await initSimnet();
    
    const accounts = simnet.getAccounts();
    deployer = accounts.get('deployer')!;
  }, 60000); // Increase timeout to 60 seconds

  it('should initialize simnet successfully', () => {
    expect(simnet).toBeDefined();
  });

  it('should have deployer account', () => {
    const accounts = simnet.getAccounts();
    const deployerAccount = accounts.get('deployer');
    expect(deployerAccount).toBeDefined();
  });

  it('should have wallet accounts', () => {
    const accounts = simnet.getAccounts();
    expect(accounts.get('wallet_1')).toBeDefined();
    expect(accounts.get('wallet_2')).toBeDefined();
    expect(accounts.get('wallet_3')).toBeDefined();
  });

  it('should have vault-stx-v2 contract deployed', () => {
    // Check if contract exists by calling a read-only function
    const { result } = simnet.callReadOnlyFn(
      'vault-stx-v2',
      'get-total-supply',
      [],
      deployer
    );
    
    expect(result).toBeDefined();
  });

  it('should have strategy-manager-v2 contract deployed', () => {
    const { result } = simnet.callReadOnlyFn(
      'strategy-manager-v2',
      'get-vault',
      [],
      deployer
    );
    
    expect(result).toBeDefined();
  });

  it('should verify contract initialization', () => {
    // Vault should start unpaused
    const { result } = simnet.callReadOnlyFn(
      'vault-stx-v2',
      'is-paused',
      [],
      deployer
    );
    
    expect(result).toBeBool(false);
  });
});
