import { useState, useEffect } from 'react';
import { useWeb3Modal, useWeb3ModalAccount, useDisconnect, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { ethers } from 'ethers';

export function useWallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { disconnect } = useDisconnect();
  const { walletProvider } = useWeb3ModalProvider();
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (walletProvider) {
      const provider = new ethers.BrowserProvider(walletProvider);
      provider.getSigner().then(setSigner);
    } else {
      setSigner(null);
    }
  }, [walletProvider]);

  function disconnectWallet() {
    disconnect();
  }

  return { open, address, isConnected, chainId, signer, disconnectWallet };
}
