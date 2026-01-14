import { useState, useEffect, useCallback } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    loading: true,
    error: null,
  });

  // Check if already connected on mount
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setState({
        isConnected: true,
        address: userData.profile.stxAddress.testnet,
        loading: false,
        error: null,
      });
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setState({
          isConnected: true,
          address: userData.profile.stxAddress.testnet,
          loading: false,
          error: null,
        });
      });
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const connectWallet = useCallback(() => {
    showConnect({
      appDetails: {
        name: 'SNP Protocol',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        setState({
          isConnected: true,
          address: userData.profile.stxAddress.testnet,
          loading: false,
          error: null,
        });
      },
      onCancel: () => {
        setState((prev) => ({
          ...prev,
          error: 'Connection cancelled',
        }));
      },
      userSession,
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setState({
      isConnected: false,
      address: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    userSession,
  };
}
