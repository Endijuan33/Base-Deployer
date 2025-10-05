
// pages/index.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
// IMPORTANT: We now get the signer from the provider, not a direct hook.
import { useWeb3Modal, useWeb3ModalAccount, useDisconnect, useWeb3ModalProvider } from '@web3modal/ethers/react';
import Image from 'next/image';
import tokenArtifact from '../artifacts/contracts/BaseBuilder.sol/BaseBuilder.json';
import Header from '../components/Header';
import DeployForm from '../components/DeployForm';
import { NativeTokenForm, ERC20TokenForm } from '../components/SendForm';
import History from '../components/History';

function Home() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { disconnect } = useDisconnect();
  const { walletProvider } = useWeb3ModalProvider();
  
  // State for the ethers signer
  const [signer, setSigner] = useState(null);

  const [contractAddress, setContractAddress] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deployForm, setDeployForm] = useState({
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: ''
  });
  const [nativeForm, setNativeForm] = useState({
    recipient: '',
    amount: ''
  });
  const [ercForm, setErcForm] = useState({
    recipient: '',
    amount: ''
  });

  const targetChainIdDecimal = 8453;
  
  // Effect to create the signer from the wallet provider
  useEffect(() => {
    if (walletProvider) {
      const provider = new ethers.BrowserProvider(walletProvider);
      provider.getSigner().then(setSigner);
    } else {
      setSigner(null);
    }
  }, [walletProvider]);
  
  useEffect(() => {
      if (!isConnected) {
          setTxStatus('');
          setContractAddress('');
      }
  }, [isConnected]);

  function disconnectWallet() {
    disconnect();
    setTxStatus('');
    setContractAddress('');
  }

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
      alert(`Please switch to the Base Sepolia network in your wallet.`);
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

  async function verifyContract(address, details) {
    const contractToVerify = address || contractAddress;
    const formDetails = details || deployForm;

    if (!contractToVerify) {
      alert("Contract address is not available. Please deploy first or select from history.");
      return;
    }
    try {
      setIsProcessing(true);
      setTxStatus(`Submitting ${formDetails.name} for verification to Basescan...`);
      
      const totalSupplyWei = ethers.parseUnits(formDetails.totalSupply, formDetails.decimals).toString();
      const constructorArgs = [
        formDetails.name,
        formDetails.symbol,
        formDetails.decimals,
        totalSupplyWei,
      ];

      const res = await fetch('/api/verify-basescan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress: contractToVerify, constructorArgs }),
      });

      const data = await res.json();
      if (res.status !== 200) {
        setTxStatus(`Verification Error: ${data.error}`);
      } else {
        setTxStatus(
          <>
            Verification submitted successfully. GUID: {data.message}. Status will be checked periodically.&nbsp;
            <a href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${contractToVerify}#code`} target="_blank" rel="noopener noreferrer">
              View Contract
            </a>
          </>
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      setTxStatus(`Verification failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

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
      alert(`Please switch to the Base Sepolia network in your wallet.`);
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
      alert(`Please switch to the Base Sepolia network in your wallet.`);
      open({ view: 'Networks' });
      return;
    }

    try {
      setIsProcessing(true);
      setTxStatus('Sending ERC20 token...');
      
      const contract = new ethers.Contract(contractAddress, tokenArtifact.abi, signer);
      const amountUnits = ethers.parseUnits(ercForm.amount, deployForm.decimals);
      
      const tx = await contract.transfer(ercForm.recipient, amountUnits); // Corrected function name

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

  return (
    <div className="card" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Header
        walletAddress={address}
        connectWalletHandler={open}
        disconnectWallet={disconnectWallet}
        isProcessing={isProcessing}
      />

      <DeployForm
        deployForm={deployForm}
        setDeployForm={setDeployForm}
        deployContract={deployContract}
        contractAddress={contractAddress}
        verifyContract={verifyContract}
        isProcessing={isProcessing}
      />

      <History verifyContract={verifyContract} isProcessing={isProcessing} />

      <NativeTokenForm
        nativeForm={nativeForm}
        setNativeForm={setNativeForm}
        sendNativeToken={sendNativeToken}
        isProcessing={isProcessing}
      />

      <ERC20TokenForm
        ercForm={ercForm}
        setErcForm={setErcForm}
        sendERC20Token={sendERC20Token}
        isProcessing={isProcessing}
      />

      <div style={{ marginTop: '20px', background: '#f2f2f2', padding: '10px', borderRadius: '4px' }}>
        <p><strong>Status:</strong> {txStatus}</p>
      </div>

      <footer style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '20px', textAlign: 'center' }}>
        <p>Built with love ❤️ for <a href="https://base.org/" target="_blank" rel="noopener noreferrer">Base.org</a>.</p>
        <p>Designed by <strong>Endcore</strong></p>
        <p>
          <a href="https://github.com/Endijuan33" target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px' }}>
            <Image src="/github-icon.png" alt="GitHub" width={20} height={20} style={{ verticalAlign: 'middle' }} /> GitHub
          </a>
          <a href="https://t.me/e0303" target="_blank" rel="noopener noreferrer">
            <Image src="/telegram-icon.png" alt="Telegram" width={20} height={20} style={{ verticalAlign: 'middle' }} /> Telegram
          </a>
        </p>
      </footer>
    </div>
  );
}

import dynamic from 'next/dynamic';
export default dynamic(() => Promise.resolve(Home), { ssr: false });
