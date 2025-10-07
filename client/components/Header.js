// components/Header.js
import Image from 'next/image';

export default function Header({
  walletAddress,
  connectWalletHandler,
  disconnectWallet,
  isProcessing,
}) {
  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        borderBottom: '1px solid #ccc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src="/base-logo.png"
          alt="Base Network"
          width={50}
          height={50}
          style={{ marginRight: '10px' }}
        />
        <h1 style={{ margin: 0 }}>Base Deployer Tools</h1>
      </div>
      <div>
        {walletAddress ? (
          <>
            <span style={{ marginRight: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {shortenAddress(walletAddress)}
            </span>
            <button
              onClick={disconnectWallet}
              disabled={isProcessing}
              style={{ padding: '8px 16px' }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={connectWalletHandler}
            disabled={isProcessing}
            style={{ padding: '8px 16px' }}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
