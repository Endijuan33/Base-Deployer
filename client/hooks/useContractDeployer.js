import { useState } from 'react';
import { ethers } from 'ethers';
import tokenArtifact from '../artifacts/contracts/BaseBuilder.sol/BASEBUILDER.json';

export function useContractDeployer(signer, chainId, open) {
  const [contractAddress, setContractAddress] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deployForm, setDeployForm] = useState({
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: ''
  });

  const targetChainIdDecimal = 8453;

  async function deployContract() {
    if (!signer) {
      alert("Wallet not connected or signer not available.");
      return;
    }
    if (!deployForm.name || !deployForm.symbol || !deployForm.totalSupply) {
      alert("Please fill in the token name, symbol, and total supply.");
      return;
    }

    if (chainId !== targetChainIdDecimal) {
      alert(`Please switch to the Base network in your wallet.`);
      open({ view: 'Networks' });
      return;
    }

    try {
      setIsProcessing(true);
      setTxStatus('Deploying contract...');

      const factory = new ethers.ContractFactory(
        tokenArtifact.abi,
        tokenArtifact.bytecode,
        signer
      );

      const totalSupplyWei = ethers.parseUnits(deployForm.totalSupply, deployForm.decimals);
      const contract = await factory.deploy(
        deployForm.name,
        deployForm.symbol,
        deployForm.decimals,
        totalSupplyWei
      );

      const deployTx = contract.deploymentTransaction();

      setTxStatus(
        <>
          Transaction sent:&nbsp;
          <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${deployTx.hash}`} target="_blank" rel="noopener noreferrer">
            {deployTx.hash.substring(0, 10)}...
          </a>
        </>
      );

      await contract.waitForDeployment();
      const deployedAddress = await contract.getAddress();
      setContractAddress(deployedAddress);

      const newDeployment = {
        address: deployedAddress,
        name: deployForm.name,
        symbol: deployForm.symbol,
        totalSupply: deployForm.totalSupply,
        decimals: deployForm.decimals
      };
      const existingDeployments = JSON.parse(localStorage.getItem('deploymentHistory')) || [];
      localStorage.setItem('deploymentHistory', JSON.stringify([...existingDeployments, newDeployment]));
      window.dispatchEvent(new CustomEvent('deployment-history-updated'));

      setTxStatus(
        <>
          Contract deployed at:&nbsp;
          <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${deployedAddress}`} target="_blank" rel="noopener noreferrer">
            {deployedAddress.substring(0, 10)}...
          </a>
          <br />
          <strong>Token Name:</strong> {deployForm.name} | <strong>Total Supply:</strong> {deployForm.totalSupply}
        </>
      );
    } catch (error) {
      console.error(error);
      setTxStatus(`Error: ${error.reason || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  return { deployForm, setDeployForm, deployContract, contractAddress, txStatus, isProcessing };
}
