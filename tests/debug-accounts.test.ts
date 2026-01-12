import { describe, it, beforeAll } from 'vitest';

let simnet: any;

describe('Debug Accounts', () => {
  beforeAll(async () => {
    const { initSimnet } = await import('@hirosystems/clarinet-sdk');
    simnet = await initSimnet();
  });

  it('should list all available accounts', () => {
    const accounts = simnet.getAccounts();
    console.log('\n=== AVAILABLE ACCOUNTS ===');
    for (const [name, address] of accounts.entries()) {
      console.log(`${name}: ${address}`);
    }
    console.log('=========================\n');
  });
});
