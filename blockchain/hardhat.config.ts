import dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
const config: HardhatUserConfig = {
  solidity: {
    version:"0.8.28",
    settings:{
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  //defaultNetwork: "local",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      }
    },
    bsctest: {
      url: process.env.NODE_URL,
      chainId: parseInt(`${process.env.CHAIN_ID}`),
      accounts: {
        mnemonic: process.env.SECRET
      }
    }
  },
  etherscan:{
    apiKey: process.env.API_KEY
  }
};

export default config;
