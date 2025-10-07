// components/DeployForm.js
export default function DeployForm({
  deployForm,
  setDeployForm,
  deployContract,
  contractAddress,
  verifyContract,
  isProcessing,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeployForm(prevForm => ({
      ...prevForm,
      [name]: name === 'decimals' ? Number(value) : value
    }));
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Deploy Contract (ERC20 Token)</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px',
        }}
      >
        <label>
          Token Name:
          <input
            type="text"
            name="name"
            placeholder="e.g., MyToken"
            value={deployForm.name}
            onChange={handleChange}
            style={{ padding: '8px', width: '100%' }}
            disabled={isProcessing}
          />
        </label>
        <label>
          Token Symbol:
          <input
            type="text"
            name="symbol"
            placeholder="e.g., MTK"
            value={deployForm.symbol}
            onChange={handleChange}
            style={{ padding: '8px', width: '100%' }}
            disabled={isProcessing}
          />
        </label>
        <label>
          Decimals (default 18):
          <input
            type="number"
            name="decimals"
            placeholder="Decimals"
            value={deployForm.decimals}
            onChange={handleChange}
            style={{ padding: '8px', width: '100%' }}
            disabled={isProcessing}
          />
        </label>
        <label>
          Total Supply:
          <input
            type="text"
            name="totalSupply"
            placeholder="e.g., 1000000"
            value={deployForm.totalSupply}
            onChange={handleChange}
            style={{ padding: '8px', width: '100%' }}
            disabled={isProcessing}
          />
        </label>
        <button
          onClick={deployContract}
          disabled={isProcessing}
          style={{ padding: '10px 20px' }}
        >
          {isProcessing ? 'Processing...' : 'Deploy Contract'}
        </button>
      </div>
      {contractAddress && (
        <div style={{ marginTop: '20px' }}>
          <p>
            <strong>Deployed Contract Address:</strong>{' '}
            <a
              href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contractAddress}
            </a>
          </p>
          <p>
            <strong>Token Name:</strong> {deployForm.name} |{' '}
            <strong>Total Supply:</strong> {deployForm.totalSupply}
          </p>
          <button
            onClick={() => verifyContract()}
            disabled={isProcessing}
            style={{ padding: '10px 20px' }}
          >
            {isProcessing ? 'Processing...' : 'Verify Contract'}
          </button>
        </div>
      )}
      <hr style={{ marginTop: '20px' }} />
    </div>
  );
}
