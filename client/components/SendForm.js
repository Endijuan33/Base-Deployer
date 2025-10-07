// components/SendForm.js
export function NativeTokenForm({
  nativeForm,
  setNativeForm,
  sendNativeToken,
  isProcessing,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNativeForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Send Native Token</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px',
        }}
      >
        <label>
          Recipient Address:
          <input
            type="text"
            name="recipient"
            placeholder="Recipient Address"
            value={nativeForm.recipient}
            onChange={handleChange}
            style={{ padding: '8px', width: '100%' }}
            disabled={isProcessing}
          />
        </label>
        <label>
          Amount (in ETH):
          <input
            type="text"
            name="amount"
            placeholder="Amount (e.g. 0.01, in ETH)"
            value={nativeForm.amount}
            onChange={handleChange}
            style={{ padding: '8px', width: '100%' }}
            disabled={isProcessing}
          />
        </label>
        <button
          onClick={sendNativeToken}
          disabled={isProcessing}
          style={{ padding: '10px 20px' }}
        >
          {isProcessing ? 'Processing...' : 'Send Native Token'}
        </button>
      </div>
      <hr style={{ marginTop: '20px' }} />
    </div>
  );
}

export function ERC20TokenForm({
  ercForm,
  setErcForm,
  sendERC20Token,
  isProcessing,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setErcForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Send ERC20 Token</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px',
        }}
      >
        <label>
          Recipient Address:
          <input
            type="text"
            name="recipient"
            placeholder="Recipient Address"
            value={ercForm.recipient}
            onChange={handleChange}
            style={{ padding: '8px', width: '100%' }}
            disabled={isProcessing}
          />
        </label>
        <label>
          Amount:
          <input
            type="text"
            name="amount"
            placeholder="Amount"
            value={ercForm.amount}
            onChange={handleChange}
            style={{ padding: '8px', width: '100%' }}
            disabled={isProcessing}
          />
        </label>
        <button
          onClick={sendERC20Token}
          disabled={isProcessing}
          style={{ padding: '10px 20px' }}
        >
          {isProcessing ? 'Processing...' : 'Send ERC20 Token'}
        </button>
      </div>
      <hr style={{ marginTop: '20px' }} />
    </div>
  );
}
