import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

const DEPLOYER = 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA';

describe('Testnet Contract Verification', () => {
  const contracts = [
    'governance',
    'vault-stx-v2',
    'vault-conservative',
    'vault-growth',
    'strategy-manager-v2',
    'strategy-alex-stx-usda',
    'strategy-arkadiko-vault',
    'strategy-bitflow-v1',
    'strategy-granite-v1',
    'strategy-hermetica-v1',
    'strategy-sbtc-v1',
    'strategy-stable-pool',
    'strategy-stackingdao-v1',
    'strategy-stackswap-v1',
    'strategy-stx-stacking',
    'strategy-velar-farm',
    'strategy-zest-v1'
  ];

  describe('Contract Deployments', () => {
    contracts.forEach(contract => {
      it(`${contract} should be deployed`, async () => {
        const response = await fetch(
          `https://api.testnet.hiro.so/v2/contracts/interface/${DEPLOYER}/${contract}`
        );
        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data).toBeDefined();
      });
    });
  });

  describe('Vault Read-Only Functions', () => {
    it('vault-stx-v2: get-name', async () => {
      const url = `https://api.testnet.hiro.so/v2/contracts/call-read/${DEPLOYER}/vault-stx-v2/get-name`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: DEPLOYER,
          arguments: []
        })
      });
      const data = await response.json();
      expect(data.okay).toBe(true);
    });

    it('vault-conservative: get-total-assets', async () => {
      const url = `https://api.testnet.hiro.so/v2/contracts/call-read/${DEPLOYER}/vault-conservative/get-total-assets`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: DEPLOYER,
          arguments: []
        })
      });
      const data = await response.json();
      expect(data.okay).toBe(true);
      expect(data.result).toBeDefined();
    });

    it('vault-growth: is-paused', async () => {
      const url = `https://api.testnet.hiro.so/v2/contracts/call-read/${DEPLOYER}/vault-growth/is-paused`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: DEPLOYER,
          arguments: []
        })
      });
      const data = await response.json();
      expect(response.ok).toBe(true);
      expect(data.okay).toBe(true);
    });
  });

  describe('Strategy Manager', () => {
    it('should read active strategies count', async () => {
      const url = `https://api.testnet.hiro.so/v2/contracts/call-read/${DEPLOYER}/strategy-manager-v2/get-strategy-count`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: DEPLOYER,
          arguments: []
        })
      });
      const data = await response.json();
      expect(data.okay).toBe(true);
    });
  });

  describe('Governance', () => {
    it('should verify governance contract exists', async () => {
      const response = await fetch(
        `https://api.testnet.hiro.so/v2/contracts/interface/${DEPLOYER}/governance`
      );
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.functions).toBeDefined();
      expect(data.functions.length).toBeGreaterThan(0);
    });
  });
});
