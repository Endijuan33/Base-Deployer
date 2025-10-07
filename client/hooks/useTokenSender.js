import { useState } from 'react';
import { ethers } from 'ethers';
import tokenArtifact from '../artifacts/contracts/BaseBuilder.sol/BASEBUILDER.json';

export function useTokenSender(signer, chainId, open, contractAddress, deployForm) {
  const [txStatus, setTxStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [nativeForm, setNativeForm] = useState({ recipient: '', amount: '' });
  const [ercForm, setErcForm] = useState({ recipient: '', amount: '' });

  const targetChainIdDecimal = 8453;

  async function sendNativeToken() {
    if (!signer) {
      alert("Wallet not connected or signer not available.");
      return;
    }
    if (!nativeForm.recipient || !nativeForm.amount) {
      alert("Please fill in the recipient address and amount.");
      return;
    }

    if (chainId !== targetChainIdDecimal) {
      alert(`Please switch to the Base network in your wallet.`);
      open({ view: 'Networks' });
      return;
    }

    try {
      setIsProcessing(true);
      setTxStatus('Sending native token...');

      const tx = await signer.sendTransaction({
        to: nativeForm.recipient,
        value: ethers.parseEther(nativeForm.amount)
      });

      setTxStatus(
        <>
          Transaction sent:&nbsp;
          <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
            {tx.hash.substring(0, 10)}...
          </a>
        </>
      );

      await tx.wait();

      setTxStatus(
        <>
          Transaction confirmed:&nbsp;
          <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
            {tx.hash.substring(0, 10)}...
          </a>
        </>
      );
    } catch (error) {
      console.error(error);
      setTxStatus(`Error: ${error.reason || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function sendERC20Token() {
    if (!signer || !contractAddress) {
      alert("Please deploy the contract and connect your wallet first.");
      return;
    }
    if (!ercForm.recipient || !ercForm.amount) {
      alert("Please fill in the recipient address and amount.");
      return;
    }

    if (chainId !== targetChainIdDecimal) {
      alert(`Please switch to the Base network in your wallet.`);
      open({ view: 'Networks' });
      return;
    }

    try {
      setIsProcessing(true);
      setTxStatus('Sending ERC20 token...');

      const contract = new ethers.Contract(contractAddress, tokenArtifact.abi, signer);
      const amountUnits = ethers.parseUnits(ercForm.amount, deployForm.decimals);

      const tx = await contract.transfer(ercForm.recipient, amountUnits);

      setTxStatus(
        <>
          Transaction sent:&nbsp;
          <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
            {tx.hash.substring(0, 10)}...
          </a>
        </>
      );

      await tx.wait();

      setTxStatus(
        <>
          Transaction confirmed:&nbsp;
          <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
            {tx.hash.substring(0, 10)}...
          </a>
        </>
      );
    } catch (error) {
      console.error(error);
      setTxStatus(`Error: ${error.reason || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    nativeForm,
    setNativeForm,
    ercForm,
    setErcForm,
    sendNativeToken,
    sendERC20Token,
    txStatus,
    isProcessing
  };
}
