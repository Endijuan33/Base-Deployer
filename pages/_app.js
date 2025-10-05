
// pages/_app.js
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// 1. Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
};

const baseSepolia = {
    chainId: 8453,
    name: 'Base',
    currency: 'ETH',
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://mainnet.base.org'
}

// 3. Create modal
const metadata = {
  name: 'Base Contract Deployer',
  description: 'Deploy smart contracts on the Base network with ease.',
  url: 'https://base-depolyer.vercel.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

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

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
