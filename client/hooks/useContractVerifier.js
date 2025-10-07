import { useState } from 'react';
import { ethers } from 'ethers';

export function useContractVerifier(deployForm, contractAddress, contractName) { // contractName as an argument
  const [txStatus, setTxStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  async function verifyContract(address, details) {
    const contractToVerify = address || contractAddress;
    const formDetails = details || deployForm;

    if (!contractToVerify) {
      alert("Contract address is not available. Please deploy first or select from history.");
      return;
    }

    if (!contractName) { // Add a check for contractName
      alert("Contract name is not provided. Cannot verify.");
      return;
    }

    try {
      setIsProcessing(true);
      setTxStatus(`Submitting ${formDetails.name} for verification to Basescan...`);
      
      const totalSupplyWei = ethers.parseUnits(formDetails.totalSupply.toString(), formDetails.decimals).toString();
      const constructorArgs = [
        formDetails.name,
        formDetails.symbol,
        formDetails.decimals,
        totalSupplyWei,
      ];

      const res = await fetch('/api/verify-basescan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            contractAddress: contractToVerify, 
            constructorArgs,
            contractName // Use the argument here
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP Error ${res.status}`);
      }

      setTxStatus(
        <>
          Verification submitted successfully. GUID: {data.message}. Status will be checked periodically.&nbsp;
          <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${contractToVerify}#code`} target="_blank" rel="noopener noreferrer">
            View Contract
          </a>
        </>
      );

    } catch (error) {
      console.error("Verification error:", error);
      setTxStatus(`Verification failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  return { txStatus, isProcessing, verifyContract };
}
