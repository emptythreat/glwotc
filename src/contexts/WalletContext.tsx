import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONFIG } from '../config';

interface WalletContextType {
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchWallet: () => Promise<void>;
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== CONFIG.CHAIN_ID) {
          throw new Error('Network mismatch. Please switch to the Ethereum mainnet to use this application.');
        }
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setIsConnected(true);
        setAddress(address);
        setProvider(provider);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        if (error instanceof Error) {
          throw new Error(error.message);
        } else {
          throw new Error('Failed to connect wallet. Please try again.');
        }
      }
    } else {
      throw new Error('No wallet detected. Please install a Web3 wallet like MetaMask to continue.');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setProvider(null);
  };

  const switchWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        await connectWallet();
      } catch (error) {
        console.error('Failed to switch wallet:', error);
        throw new Error('Failed to switch wallet. Please try again.');
      }
    } else {
      throw new Error('No wallet detected. Please install a Web3 wallet like MetaMask to continue.');
    }
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
      } else {
        setIsConnected(false);
        setAddress(null);
        setProvider(null);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected, connectWallet, disconnectWallet, switchWallet, address, provider }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};