import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'c3c72abd1d4766b3a5d199f2ba0e8027'

// 2. Set chains
const baseSepolia = {
  chainId: 84532,
  name: 'Base Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia-explorer.base.org',
  rpcUrl: 'https://sepolia.base.org'
}

// 3. Create modal
const metadata = {
  name: 'Base Contract Deployer',
  description: 'Deploy smart contracts on Base Sepolia',
  url: 'https://github.com/endijuan33/Base-Contract-Deployer',
  icons: ['/base-logo.png']
}

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [baseSepolia],
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

export function Web3ModalProvider({ children }) {
  return children;
}
