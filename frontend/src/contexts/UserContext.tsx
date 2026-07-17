import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useAccount, useSignMessage, useSwitchChain } from 'wagmi';
import { SiweMessage } from 'siwe';
import { api } from '../lib/api';
import { injectiveTestnet } from '../lib/wagmi';
import toast from 'react-hot-toast';

export type AuthStatus = 'idle' | 'pending' | 'success' | 'failed';

interface UserContextValue {
  userId: string;
  authStatus: AuthStatus;
  siweError: string;
  retrySignIn: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const [userId, setUserId] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [siweError, setSiweError] = useState<string>('');

  const signIn = useCallback(async () => {
    if (!address) {
      setUserId('');
      setAuthStatus('idle');
      setSiweError('');
      localStorage.removeItem('vantage:token');
      localStorage.removeItem('vantage:address');
      return;
    }

    // Auto-switch to Injective EVM Testnet if the wallet is on a different chain
    if (chainId && chainId !== injectiveTestnet.id) {
      try {
        await switchChainAsync({ chainId: injectiveTestnet.id });
      } catch {
        // User dismissed the switch prompt -- proceed anyway;
        // the nav chip and banner will show the mismatch visually.
      }
    }

    const token = localStorage.getItem('vantage:token');
    const savedAddress = localStorage.getItem('vantage:address');

    if (token && savedAddress === address.toLowerCase()) {
      setUserId(address.toLowerCase());
      setAuthStatus('success');
      setSiweError('');
      return;
    }

    setAuthStatus('pending');
    setSiweError('');

    try {
      const nonceRes = await api.get<string>('/api/auth/nonce');
      const nonce = nonceRes.data;

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the Vantage platform.',
        uri: window.location.origin,
        version: '1',
        chainId: chainId ?? 1,
        nonce,
      });

      const preparedMessage = message.prepareMessage();
      const signature = await signMessageAsync({ message: preparedMessage });

      const verifyRes = await api.post('/api/auth/verify', { message, signature });

      localStorage.setItem('vantage:token', verifyRes.data.token);
      localStorage.setItem('vantage:address', verifyRes.data.address.toLowerCase());
      setUserId(verifyRes.data.address.toLowerCase());
      setAuthStatus('success');
      setSiweError('');
      toast.success('Successfully authenticated!');
    } catch (err) {
      console.error('SIWE Error:', err);
      const message =
        err instanceof Error ? err.message : 'Unknown error during sign-in';
      setSiweError(message);
      setAuthStatus('failed');
      setUserId('');
    }
  }, [address, chainId, signMessageAsync, switchChainAsync]);

  // Trigger signIn when address changes (wallet connects)
  useEffect(() => {
    signIn();
  }, [signIn]);

  // Exposed retry function -- re-triggers the SIWE flow with the already-connected wallet
  const retrySignIn = useCallback(() => {
    signIn();
  }, [signIn]);

  return (
    <UserContext.Provider value={{ userId, authStatus, siweError, retrySignIn }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
