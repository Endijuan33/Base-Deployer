
import { useState, useEffect } from 'react';

export default function History({ verifyContract, isProcessing }) {
  const [history, setHistory] = useState([]);

  const updateHistory = () => {
    const storedHistory = localStorage.getItem('deploymentHistory');
    setHistory(storedHistory ? JSON.parse(storedHistory) : []);
  };

  useEffect(() => {
    updateHistory(); // Initial load

    window.addEventListener('deployment-history-updated', updateHistory);

    return () => {
      window.removeEventListener('deployment-history-updated', updateHistory);
    };
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear the deployment history? This action cannot be undone.")) {
        localStorage.removeItem('deploymentHistory');
        updateHistory(); // Re-render the component with no history
    }
  };

  if (history.length === 0) {
    return (
        <div style={{ marginTop: '30px' }}>
            <h2>Deployed Contracts History</h2>
            <p>No deployment history yet.</p>
            <hr style={{ marginTop: '20px' }} />
        </div>
    );
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Deployed Contracts History</h2>
        <button 
            onClick={clearHistory}
            style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
        >
            Clear History
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Contract Address</th>
            <th style={tableHeaderStyle}>Name</th>
            <th style={tableHeaderStyle}>Symbol</th>
            <th style={tableHeaderStyle}>Total Supply</th>
            <th style={tableHeaderStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr key={index}>
              <td style={tableCellStyle}>
                <a 
                  href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${item.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${item.address.substring(0, 6)}...${item.address.substring(item.address.length - 4)}`}
                </a>
              </td>
              <td style={tableCellStyle}>{item.name}</td>
              <td style={tableCellStyle}>{item.symbol}</td>
              <td style={tableCellStyle}>{item.totalSupply}</td>
              <td style={tableCellStyle}>
                <button 
                  onClick={() => verifyContract(item.address, item)} 
                  disabled={isProcessing}
                  style={{ padding: '5px 10px' }}
                >
                  {isProcessing ? 'Verifying...' : 'Verify'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr style={{ marginTop: '20px' }} />
    </div>
  );
}

const tableHeaderStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left',
  backgroundColor: '#f2f2f2',
};

const tableCellStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'left',
};
