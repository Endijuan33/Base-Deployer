require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

module.exports = {
  solidity: "0.8.28",
  networks: {
    "tea-testnet": {
      url: process.env.RPC_URL || "https://tea-sepolia.g.alchemy.com/public",
      chainId: 10218,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      "tea-testnet": process.env.EXPLORER_API_KEY || "empty"
    },
    customChains: [
      {
        network: "tea-testnet",
        chainId: 10218,
        urls: {
          apiURL: "https://sepolia.tea.xyz/api",
          browserURL: "https://sepolia.tea.xyz/"
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  }
};
