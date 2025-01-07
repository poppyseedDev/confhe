import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { ErrorComponent } from '../Error/Error';
import { createFhevmInstance } from '../../fhevmjs';
import { useStartBallot } from '../../hooks/useBallotContract';
import './Connect.css';

const AUTHORIZED_CHAIN_ID = ['0xaa36a7', '0x2328', '0x7a69'];

export const Connect: React.FC<{
  children: (account: string, provider: any) => React.ReactNode;
  onConnectionSuccess: () => void;
}> = ({ children, onConnectionSuccess }) => {
  const [connected, setConnected] = useState(false);
  const [validNetwork, setValidNetwork] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [loading, setLoading] = useState(false);

  // Hook para iniciar el ballot
  const {
    startBallot,
    loading: startingBallot,
    error: startBallotError,
  } = useStartBallot();

  const refreshAccounts = (accounts: string[]) => {
    setAccount(accounts[0] || null);
    setConnected(accounts.length > 0);
    if (accounts.length > 0 && validNetwork) {
      onConnectionSuccess();
      startBallot(); // Llamar a startBallot automáticamente
    }
  };

  const hasValidNetwork = async (): Promise<boolean> => {
    try {
      const currentChainId: string = await window.ethereum.request({
        method: 'eth_chainId',
      });
      return AUTHORIZED_CHAIN_ID.includes(currentChainId.toLowerCase());
    } catch (e) {
      setError('Could not verify the network. Please check your connection.');
      return false;
    }
  };

  const refreshNetwork = useCallback(async () => {
    try {
      const isValid = await hasValidNetwork();
      setValidNetwork(isValid);
      if (isValid) {
        setError(null);
        setLoading(true);
        try {
          await createFhevmInstance();
          console.log('FHEVM initialized successfully!');
        } catch (e) {
          console.error('Error during FHEVM initialization:', e);
          setError(
            'Failed to initialize FHEVM. Check configuration or connection.',
          );
        } finally {
          setLoading(false);
        }
      }
    } catch (e) {
      console.error('Network verification error:', e);
      setError('Error verifying the network.');
    }
  }, []);

  const refreshProvider = (eth: any) => {
    const p = new BrowserProvider(eth);
    setProvider(p);
    return p;
  };

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) {
      setError('No wallet detected.');
      return;
    }

    const p = refreshProvider(eth);

    p.send('eth_accounts', [])
      .then(refreshAccounts)
      .then(refreshNetwork)
      .catch(() => setError('Error connecting to the wallet.'));
  }, [refreshNetwork]);

  const connect = async () => {
    if (!provider) {
      setError('No provider configured.');
      return;
    }

    try {
      setLoading(true);
      const accounts = await provider.send('eth_requestAccounts', []);
      refreshAccounts(accounts);
      if (!(await hasValidNetwork())) {
        await switchNetwork();
      }
    } catch (e: any) {
      setError(e.message || 'Error connecting to Metamask.');
    } finally {
      setLoading(false);
    }
  };

  const switchNetwork = useCallback(async () => {
    try {
      const chainId = AUTHORIZED_CHAIN_ID[0]; // Default to the first chain in the list
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      await refreshNetwork();
    } catch (e) {
      setError('Error switching network. Please check your configuration.');
    }
  }, [refreshNetwork]);

  const child = useMemo(() => {
    if (!account || !provider) return null;

    if (!validNetwork) {
      return (
        <div>
          <p>You are not connected to the correct network.</p>
          <button onClick={switchNetwork}>
            Switch to the authorized network
          </button>
        </div>
      );
    }

    if (loading || startingBallot) return <p>Loading...</p>;

    return children(account, provider);
  }, [account, provider, children, validNetwork, loading, startingBallot]);

  if (error || startBallotError) {
    return (
      <ErrorComponent
        errorMessage={error || startBallotError || ''}
        onConnectionSuccess={(account) => setAccount(account)}
        onConnectionError={(err) => setError(err)}
      />
    );
  }

  return (
    <div className="Connect">
      {!connected && <button onClick={connect}>Connect Wallet</button>}
      {connected && <p>Connected as: {account}</p>}
      <div>{child}</div>
    </div>
  );
};