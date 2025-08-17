import { useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { checkNetwork } from '../utils/web3';

const injected = new InjectedConnector({
  supportedChainIds: [31337], // Hardhat localhost
});

export const useWeb3Connection = () => {
  const { account, activate, deactivate } = useWeb3React();

  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Vui lòng cài đặt MetaMask');
      }
      await activate(injected);
      const provider = window.ethereum;
      await checkNetwork(provider);
    } catch (error) {
      console.error('Error connecting:', error);
      throw error;
    }
  }, [activate]);

  const disconnect = useCallback(() => {
    try {
      deactivate();
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  }, [deactivate]);

  return {
    account,
    connect,
    disconnect,
    isConnected: !!account,
  };
}; 