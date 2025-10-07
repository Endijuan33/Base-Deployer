import { ethers } from 'ethers';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const ETHERSCAN_V2_API_URL = 'https://api.etherscan.io/v2/api';
const CHAIN_ID = 8453; // Base

// Helper function to find the most complete build info file for a given contract
const findBuildInfo = (contractName) => {
  const artifactsPath = path.join(process.cwd(), 'artifacts');
  const buildInfoPath = path.join(artifactsPath, 'build-info');
  
  if (!fs.existsSync(buildInfoPath)) return null;

  const buildInfoFiles = fs.readdirSync(buildInfoPath);
  for (const file of buildInfoFiles) {
    const buildInfoContent = JSON.parse(fs.readFileSync(path.join(buildInfoPath, file), 'utf8'));
    
    const contractFileName = `contracts/${contractName}.sol`;
    // Robust check: Ensure both the main contract AND its key import are in the sources
    const hasMainContract = !!buildInfoContent.input.sources[contractFileName];
    const hasImport = !!buildInfoContent.input.sources['@openzeppelin/contracts/token/ERC20/ERC20.sol'];

    if (hasMainContract && hasImport) {
      return buildInfoContent; // Found a complete build-info file
    }
  }
  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { contractAddress, constructorArgs } = req.body;
  const apiKey = process.env.BASESCAN_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Basescan API key not found in environment variables.' });
  }

  if (!contractAddress || !constructorArgs) {
    return res.status(400).json({ error: 'Contract address and constructor arguments are required.' });
  }

  try {
    const contractName = 'CustomToken';

    // 1. Find the most complete build-info file
    const buildInfo = findBuildInfo(contractName);
    if (!buildInfo) {
        return res.status(404).json({ error: 'A complete build-info file was not found. Please run `npx hardhat clean && npx hardhat compile` and try again.' });
    }

    // 2. Prepare the payload for Etherscan API
    const standardJsonInput = JSON.stringify(buildInfo.input);
    const compilerVersion = `v${buildInfo.solcLongVersion}`;

    // ABI-encode constructor arguments
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const encodedConstructorArgs = abiCoder.encode(
        ['string', 'string', 'uint8', 'uint256'], 
        constructorArgs
    ).slice(2); // Remove '0x' prefix

    const formData = new URLSearchParams();
    formData.append('apikey', apiKey);
    formData.append('module', 'contract');
    formData.append('action', 'verifysourcecode');
    formData.append('contractaddress', contractAddress);
    formData.append('sourceCode', standardJsonInput);
    formData.append('codeformat', 'solidity-standard-json-input');
    formData.append('contractname', `contracts/${contractName}.sol:${contractName}`);
    formData.append('compilerversion', compilerVersion);
    formData.append('constructorArguements', encodedConstructorArgs);

    // Delay to ensure contract is propagated on the network
    await new Promise(resolve => setTimeout(resolve, 15000)); 

    // 3. Send verification request to Etherscan V2 API
    const response = await axios.post(`${ETHERSCAN_V2_API_URL}?chainid=${CHAIN_ID}`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data.status === '1') {
      const guid = response.data.result;
      let checkCount = 0;
      const maxChecks = 10;

      while (checkCount < maxChecks) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const checkResponse = await axios.get(ETHERSCAN_V2_API_URL, {
            params: { chainid: CHAIN_ID, apikey: apiKey, module: 'contract', action: 'checkverifystatus', guid: guid }
        });

        if (checkResponse.data.result.includes('Pass - Verified')) {
            return res.status(200).json({ message: checkResponse.data.result });
        } else if (checkResponse.data.result.includes('Pending')) {
            checkCount++;
        } else {
            return res.status(500).json({ error: `Verification failed: ${checkResponse.data.result}` });
        }
      }
      return res.status(500).json({ error: 'Verification timed out. Check the status on Basescan manually.' });

    } else {
      return res.status(500).json({ error: `Basescan API Error: ${response.data.result}` });
    }

  } catch (error) {
    console.error('Verification internal error:', error.response ? error.response.data : error);
    if (error.code) {
      return res.status(500).json({ error: `Verification Error: ${error.reason} (code: ${error.code})`});
    }
    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}
