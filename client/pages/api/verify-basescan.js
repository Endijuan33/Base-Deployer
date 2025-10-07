import { ethers } from 'ethers';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const CHAIN_ID = 8453; // Base

const findBuildInfo = (contractName) => {
  const artifactsPath = path.join(process.cwd(), 'artifacts', 'build-info');
  if (!fs.existsSync(artifactsPath)) return null;

  const buildInfoFiles = fs.readdirSync(artifactsPath);
  const contractFileName = `contracts/${contractName}.sol`;

  for (const file of buildInfoFiles) {
    const buildInfoContent = JSON.parse(fs.readFileSync(path.join(artifactsPath, file), 'utf8'));
    const contractKey = `${contractFileName}:${contractName}`;

    if (buildInfoContent.output.contracts && buildInfoContent.output.contracts[contractFileName] && buildInfoContent.output.contracts[contractFileName][contractName]) {
        const hasMainContractSource = !!buildInfoContent.input.sources[contractFileName];
        const hasImports = Object.keys(buildInfoContent.input.sources).some(key => key.includes('@openzeppelin'));

        if (hasMainContractSource && hasImports) {
            return buildInfoContent;
        }
    }
  }
  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { contractAddress, constructorArgs, contractName } = req.body;
  const apiKey = process.env.BASESCAN_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_BASESCAN_API_URL;

  if (!apiKey || !apiUrl) {
    return res.status(500).json({ error: 'Basescan API key or URL not found in environment variables.' });
  }

  if (!contractAddress || !constructorArgs || !contractName) {
    return res.status(400).json({ error: 'contractAddress, constructorArgs, and contractName are required.' });
  }

  try {
    const buildInfo = findBuildInfo(contractName);
    if (!buildInfo) {
      return res.status(404).json({ error: `Could not find a complete build-info file for ${contractName}. Try running 'npx hardhat clean && npx hardhat compile' and redeploy.` });
    }

    const standardJsonInput = JSON.stringify(buildInfo.input);
    const compilerVersion = `v${buildInfo.solcLongVersion}`;

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const encodedConstructorArgs = abiCoder.encode(
        // Updated types to include the dynamic salt
        ['string', 'string', 'uint8', 'uint256', 'bytes32'], 
        constructorArgs
    ).slice(2);

    const formData = new URLSearchParams();
    formData.append('apikey', apiKey);
    formData.append('module', 'contract');
    formData.append('action', 'verifysourcecode');
    formData.append('contractaddress', contractAddress);
    formData.append('sourceCode', standardJsonInput);
    formData.append('codeformat', 'solidity-standard-json-input');
    formData.append('contractname', `contracts/${contractName}.sol:${contractName}`);
    formData.append('compilerversion', compilerVersion);
    formData.append('constructorArguments', encodedConstructorArgs);

    // Increased delay to give Basescan more time to register the contract
    await new Promise(resolve => setTimeout(resolve, 20000)); 

    const response = await axios.post(`${apiUrl}?chainid=${CHAIN_ID}`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data.status === '1') {
      const guid = response.data.result;
      let checkCount = 0;
      const maxChecks = 10;

      while (checkCount < maxChecks) {
        await new Promise(resolve => setTimeout(resolve, 6000)); // Increased polling interval

        const checkResponse = await axios.get(apiUrl, {
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
    console.error('Verification internal error:', error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.error || error.reason || error.message || 'An internal server error occurred.';
    return res.status(500).json({ error: errorMessage });
  }
}
