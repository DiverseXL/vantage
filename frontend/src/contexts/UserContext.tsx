import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface UserContextValue {
  userId: string;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (!address) {
      setUserId('');
      localStorage.removeItem('vantage:token');
      localStorage.removeItem('vantage:address');
      return;
    }

    const token = localStorage.getItem('vantage:token');
    const savedAddress = localStorage.getItem('vantage:address');

    if (token && savedAddress === address.toLowerCase()) {
      setUserId(address.toLowerCase());
      return;
    }

    const signIn = async () => {
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
        toast.success('Successfully authenticated!');
      } catch (err) {
        console.error('SIWE Error:', err);
        toast.error('Authentication failed. Balance viewing is restricted.');
        setUserId('');
      }
    };

    signIn();
  }, [address, chainId, signMessageAsync]);

  return (
    <UserContext.Provider value={{ userId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
