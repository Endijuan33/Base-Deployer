# Base Token Deployer

A Next.js web application integrated with Hardhat to deploy, send, and verify a custom ERC-20 token on the Base Sepolia network.

## Project Architecture

This project combines a Next.js frontend with a Hardhat backend to provide a user-friendly interface for managing smart contracts.

- **Frontend (`/pages`, `/components`):** Built with Next.js and React, providing forms for user interaction.
- **Smart Contracts (`/contracts`):** Contains `CustomToken.sol`, a standard implementation of an ERC-20 token.
- **Blockchain Configuration (`/blockchain`):** Uses Ethers.js and Web3Modal to connect the frontend to the user's wallet and interact with the blockchain.
- **Backend & Automation (`/pages/api`):** An API route for automatic contract verification on Basescan.
- **Deployment:** Hosted on Vercel with a GitOps workflow for continuous deployment.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MetaMask wallet or another WalletConnect-compatible wallet

## Installation and Configuration Guide

**1. Clone the Repository**

```bash
git clone https://github.com/Endijuan33/Base-Depolyer.git
cd Base-Depolyer
```

**2. Install Dependencies**

This project uses numerous JavaScript libraries. Install them all with:

```bash
npm install
```

**3. Configure Environment Variables**

Create a `.env.local` file in the project's root directory and add the following variables. These are crucial for connecting to the blockchain and third-party services.

```env
NEXT_PUBLIC_ALCHEMY_API_KEY="YOUR_ALCHEMY_API_KEY"
NEXT_PUBLIC_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"
NEXT_PUBLIC_BASESCAN_API_KEY="YOUR_BASESCAN_API_KEY"
```

- `YOUR_ALCHEMY_API_KEY`: API key from [Alchemy](https://www.alchemy.com/) for Base Sepolia node access.
- `YOUR_WALLETCONNECT_PROJECT_ID`: Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).
- `YOUR_BASESCAN_API_KEY`: API key from [Basescan](https://basescan.org/) for contract verification.
- `PRIVATE_KEY`: The private key of the wallet you will use for deployment (ensure it has funds on the Base Sepolia network).

**4. Compile the Smart Contract**

Before interacting with the contract, compile it first using Hardhat:

```bash
npx hardhat compile
```

This command will generate the ABI and bytecode files inside the `artifacts` directory, which the frontend will use to interact with the contract.

## Running the Application

**1. Run the Development Server**

To run the application in a local development environment:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**2. Build for Production**

To create an optimized production build:

```bash
npm run build
```

**3. Run the Production Build**

To run the server from the production build:

```bash
npm run start
```

## How to Use the Application

1.  **Connect Wallet:** Click the "Connect Wallet" button to connect your MetaMask or WalletConnect wallet. Ensure you are on the Base network.
2.  **Deploy Token:** Use the "Deploy Token" form to create a new ERC-20 token. Fill in the name, symbol, and initial supply, then click "Deploy".
3.  **Send Tokens:** After the token is successfully deployed, use the "Send Token" form to transfer tokens to another address.
4.  **Contract Verification:** The verification process on Basescan will run automatically after a successful deployment.

## Available Scripts

- `npm run dev`: Runs the development server.
- `npm run build`: Creates a production build.
- `npm run start`: Runs the production server.
- `npm run lint`: Runs the Next.js linter.
