import { useState } from 'react';
import { ethers } from 'ethers';

export function useContractVerifier(deployForm, contractAddress) {
  const [txStatus, setTxStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  async function verifyContract(address, details) {
    const contractToVerify = address || contractAddress;
    const formDetails = details || deployForm;
    const contractName = 'BaseBuilder'; // Hardcoded for now, as it's the only contract

    if (!contractToVerify) {
      alert("Contract address is not available. Please deploy first or select from history.");
      return;
    }

    try {
      setIsProcessing(true);
      setTxStatus(`Submitting ${formDetails.name} (${contractName}) for verification to Basescan...`);

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
            contractName 
        }),
      });

      const data = await res.json();

      if (!res.ok) { // res.ok is false if status is 4xx or 5xx
        throw new Error(data.error || `HTTP Error ${res.status}`);
      }

      setTxStatus(
        <>
          ✅ Verification successful! Contract code is now public.&nbsp;
          <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${contractToVerify}#code`} target="_blank" rel="noopener noreferrer">
            View Verified Contract on Basescan
          </a>
        </>
      );

    } catch (error) {
      console.error("Verification submission error:", error);
      setTxStatus(
        <>
          ❌ Verification Failed: {error.message}.&nbsp;
          <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${contractToVerify}#code`} target="_blank" rel="noopener noreferrer">
            Check on Basescan
          </a>
        </>
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return { verifyContract, txStatus, isProcessing };
}
