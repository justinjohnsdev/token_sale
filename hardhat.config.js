import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import { config as dotenvConfig } from 'dotenv';


dotenvConfig(); // Load environment variables from .env file

const privateKey = process.env.PRIVATE_KEY || '';
const etherscanAPIKey = process.env.ETHERSCAN_API_KEY || '';

// Check if INFURA_ID is set as well
if (!process.env.INFURA_ID) {
  throw new Error('INFURA_ID environment variable is not set.');
}

function getNetwork(name){
  const url = `https://${name}.infura.io/v3/${process.env.INFURA_ID}`;
  return {
    url,
    accounts: [privateKey, privateKey],
  };
}

const optimizedCompilerSettings = {
  version: '0.8.20', // Use the desired compiler version
  settings: {
    optimizer: { enabled: true, runs: 1000000 },
  },
};

const config = {
  solidity: {
    compilers: [optimizedCompilerSettings], // Use the compiler settings for all contracts
  },
  networks: {
    amoy: getNetwork('polygon-amoy'),
  },
  etherscan: {
    apiKey: {
      polygonAmoy: etherscanAPIKey
    }
  },
  mocha: {
    timeout: 10000,
  },
};

export default config;
