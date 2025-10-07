import { createContext, useContext, useEffect, useState } from 'react';

const Web3Context = createContext(null);

export function useWeb3() {
  return useContext(Web3Context);
}

// Renamed for clarity
let isModalInitialized = false;

export function Web3Provider({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initializeModal() {
      // Prevent re-initialization
      if (isModalInitialized) {
        setIsReady(true);
        return;
      }

      try {
        const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
        if (!projectId) {
          throw new Error('NEXT_PUBLIC_PROJECT_ID env variable is missing!');
        }

        // Dynamically import modules
        const { createWeb3Modal, defaultConfig } = await import('@web3modal/ethers/react');
        const { mainnet, base } = await import('../config/chains');
        
        const metadata = {
          name: 'Base Contract Deployer',
          description: 'Deploy smart contracts on the Base network with ease.',
          url: 'https://base-depolyer.vercel.app',
          icons: ['https://avatars.githubusercontent.com/u/37784886']
        };

        // This is the core asynchronous operation
        createWeb3Modal({
          ethersConfig: defaultConfig({
            metadata,
            enableEIP6963: true,
            enableInjected: true,
            enableCoinbase: true,
            rpcUrl: 'https://mainnet.base.org',
            defaultChainId: 8453
          }),
          chains: [base, mainnet],
          projectId,
          enableAnalytics: true
        });

        isModalInitialized = true;
        
      } catch (error) {
        console.error('Failed to initialize Web3Modal:', error);
      } finally {
        // IMPORTANT: Set ready to true regardless of success or failure
        // This ensures the rest of the app can render.
        // Error handling for a failed modal can be done elsewhere if needed.
        setIsReady(true);
      }
    }

    initializeModal();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <Web3Context.Provider value={{ ready: isReady }}>
      {/* Only render children when the modal is ready */}
      {isReady ? children : null}
    </Web3Context.Provider>
  );
}
