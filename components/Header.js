// components/Header.js

export default function Header({
  walletAddress,
  connectWalletHandler,
  disconnectWallet,
  isProcessing,
}) {

  const handleConnectClick = () => {
    if (!isProcessing) {
      connectWalletHandler();
    }
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
        <img
          src="/base-logo.png"
          alt="Base Sepolia Network"
          style={{ height: '50px', marginRight: '10px' }}
        />
        <h1 style={{ margin: 0 }}>Base Sepolia Deployer Tools</h1>
      </div>
      <div>
        {walletAddress ? (
          <>
            <span style={{ marginRight: '10px', fontWeight: 'bold' }}>
              {walletAddress}
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
            onClick={handleConnectClick}
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
