import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
};

const base = {
  chainId: 8453,
  name: 'Base',
  currency: 'ETH',
  explorerUrl: 'https://basescan.org',
  rpcUrl: 'https://mainnet.base.org'
};

const metadata = {
  name: 'Base Contract Deployer',
  description: 'Deploy smart contracts on the Base network with ease.',
  url: 'https://base-depolyer.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

let modalCreated = false;

export default function App({ Component, pageProps }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initModal() {
      // Only run on client
      if (typeof window === 'undefined') {
        setReady(true);
        return;
      }

      const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
      if (!projectId) {
        console.error("NEXT_PUBLIC_PROJECT_ID env variable is missing!");
        setReady(true);
        return;
      }

      // Skip if ethereum not available (preview / sandbox)
      if (!window.ethereum) {
        console.warn("window.ethereum not found. Web3Modal skipped.");
        setReady(true);
        return;
      }

      if (!modalCreated) {
        try {
          const { createWeb3Modal, defaultConfig } = await import('@web3modal/ethers/react');

          createWeb3Modal({
            ethersConfig: defaultConfig({
              metadata,
              enableEIP6963: true,
              enableInjected: true,
              enableCoinbase: true,
              rpcUrl: 'https://mainnet.base.org',
              defaultChainId: 8453,
            }),
            chains: [base, mainnet],
            projectId,
            enableAnalytics: true
          });

          modalCreated = true;
        } catch (e) {
          console.error("Failed to create Web3Modal:", e);
        }
      }

      setReady(true);
    }

    initModal();
  }, []);

  return (
    <>
      {ready ? <Component {...pageProps} /> : null}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
