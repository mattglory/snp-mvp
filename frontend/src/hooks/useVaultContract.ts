import { useState, useCallback } from 'react';
import {
  makeContractSTXPostCondition,
  FungibleConditionCode,
  PostConditionMode,
  AnchorMode,
  uintCV,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { UserSession } from '@stacks/connect';
import { openContractCall } from '@stacks/connect';

const network = new StacksTestnet();

const CONTRACT_ADDRESS = 'ST2H682D5RWFBHS1W3ASG3WVP5ARQVN0QABEG9BEA';

export interface DepositParams {
  vaultContract: string;
  amount: number;
}

export interface WithdrawParams {
  vaultContract: string;
  shares: number;
  minAssets: number;
  deadline: number;
}

export function useVaultContract(userSession: UserSession) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const deposit = useCallback(async (params: DepositParams) => {
    if (!userSession.isUserSignedIn()) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);

    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: params.vaultContract,
        functionName: 'deposit',
        functionArgs: [
          uintCV(params.amount),  // Only one argument!
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        postConditions: [
          makeContractSTXPostCondition(
            CONTRACT_ADDRESS,
            params.vaultContract,
            FungibleConditionCode.LessEqual,
            params.amount
          ),
        ],
        onFinish: (data: any) => {
          console.log('Transaction broadcast!', data.txId);
          setTxId(data.txId);
          setLoading(false);
        },
        onCancel: () => {
          setError('Transaction cancelled');
          setLoading(false);
        },
      });
    } catch (err: any) {
      console.error('Deposit error:', err);
      setError(err.message || 'Failed to deposit');
      setLoading(false);
    }
  }, [userSession]);

  const withdraw = useCallback(async (params: WithdrawParams) => {
    if (!userSession.isUserSignedIn()) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);

    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: params.vaultContract,
        functionName: 'withdraw',
        functionArgs: [
          uintCV(params.shares),
          uintCV(params.minAssets),
          uintCV(params.deadline),
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: any) => {
          console.log('Withdrawal broadcast!', data.txId);
          setTxId(data.txId);
          setLoading(false);
        },
        onCancel: () => {
          setError('Transaction cancelled');
          setLoading(false);
        },
      });
    } catch (err: any) {
      console.error('Withdraw error:', err);
      setError(err.message || 'Failed to withdraw');
      setLoading(false);
    }
  }, [userSession]);

  return {
    deposit,
    withdraw,
    loading,
    error,
    txId,
  };
}
