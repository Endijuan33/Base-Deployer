import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useWallet } from '../hooks/useWallet';
import { useContractDeployer } from '../hooks/useContractDeployer';
import { useContractVerifier } from '../hooks/useContractVerifier';
import { useTokenSender } from '../hooks/useTokenSender';
import Header from '../components/Header';
import DeployForm from '../components/DeployForm';
import { NativeTokenForm, ERC20TokenForm } from '../components/SendForm';
import History from '../components/History';

function Home() {
  const { open, address, isConnected, chainId, signer, disconnectWallet } = useWallet();
  const {
    deployForm, 
    setDeployForm, 
    deployContract, 
    contractAddress, 
    txStatus: deployStatus, 
    isProcessing: isDeploying
  } = useContractDeployer(signer, chainId, open);
  const {
    verifyContract, 
    txStatus: verifyStatus, 
    isProcessing: isVerifying 
  } = useContractVerifier(deployForm, contractAddress, 'BaseBuilder');
  const {
    nativeForm, 
    setNativeForm, 
    ercForm, 
    setErcForm, 
    sendNativeToken, 
    sendERC20Token, 
    txStatus: sendStatus, 
    isProcessing: isSending
  } = useTokenSender(signer, chainId, open, contractAddress, deployForm);

  const isProcessing = isDeploying || isVerifying || isSending;
  const txStatus = deployStatus || verifyStatus || sendStatus;

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
        isProcessing={isDeploying}
      />

      <History verifyContract={verifyContract} isProcessing={isVerifying} />

      <NativeTokenForm
        nativeForm={nativeForm}
        setNativeForm={setNativeForm}
        sendNativeToken={sendNativeToken}
        isProcessing={isSending}
      />

      <ERC20TokenForm
        ercForm={ercForm}
        setErcForm={setErcForm}
        sendERC20Token={sendERC20Token}
        isProcessing={isSending}
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

export default dynamic(() => Promise.resolve(Home), { ssr: false });
