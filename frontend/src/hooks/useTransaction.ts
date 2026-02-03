import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

type TransactionState = 
  | 'idle'
  | 'approval-needed'
  | 'approving'
  | 'pending'
  | 'confirming'
  | 'success'
  | 'error';

interface TransactionOptions {
  vaultId: string;
  amount: number;
  type: 'deposit' | 'withdraw';
}

export function useTransaction() {
  const [state, setState] = useState<TransactionState>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const transactionMutation = useMutation({
    mutationFn: async ({ vaultId: _vaultId, amount, type }: TransactionOptions) => {
      setState('pending');
      toast.loading(`Confirm ${type} in wallet...`, { id: 'tx' });
      
      // TODO: Implement actual transaction logic using @stacks/transactions
      // This is a placeholder that simulates the transaction flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setState('confirming');
      toast.loading('Transaction confirming...', { id: 'tx' });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return { 
        txId: '0x' + Math.random().toString(16).substring(2, 10),
        type,
        amount 
      };
    },
    onMutate: async ({ vaultId, amount, type }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['vault', vaultId] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['vault', vaultId]);
      
      // Optimistically update based on transaction type
      queryClient.setQueryData(['vault', vaultId], (old: any) => {
        if (!old) return old;
        
        const change = type === 'deposit' ? amount : -amount;
        return {
          ...old,
          userBalance: (old?.userBalance || 0) + change,
          tvl: (old?.tvl || 0) + change,
        };
      });
      
      return { previousData };
    },
    onSuccess: (data) => {
      setState('success');
      setTxId(data.txId);
      toast.success(
        `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} successful!`, 
        { id: 'tx', duration: 5000 }
      );
    },
    onError: (error: any, variables, context) => {
      setState('error');
      toast.error(error?.message || 'Transaction failed', { id: 'tx' });
      
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['vault', variables.vaultId], context.previousData);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Refetch after success or error to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['vault', variables.vaultId] });
    },
  });

  return {
    state,
    txId,
    execute: transactionMutation.mutate,
    isLoading: transactionMutation.isPending,
    reset: () => {
      setState('idle');
      setTxId(null);
      transactionMutation.reset();
    },
  };
}
