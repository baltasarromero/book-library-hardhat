import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig, task, subtask } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const lazyImport = async (module: any) => {
  return await import(module);
};

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
    compilers: [
      {
        version: "0.8.17",
      },
    ],
  },
  networks: {
    // Goerli Testnet
    goerli: {
      url: process.env.INFURA_GOERLI_URL || "",
      chainId: 5,
      accounts: [
      ],
    },
    sepolia: {
      url: process.env.INFURA_SEPOLIA_URL || "",
      chainId: 11155111,
      accounts: [
      ],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at <https://etherscan.io/>
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  }
};



task("deploy-with-pk-to-selected-network", "Deploys contract with pk")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey}) => {
    const { main } = await lazyImport("./scripts/deploy-book-library-with-pk-to-selected-network");
    await main(privateKey);
  });  

task("deploy-library-token", "Deploys contract with pk")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey}) => {
    const { main } = await lazyImport("./scripts/deploy-library-token");
    await main(privateKey);
  });    

task("deploy-permit-library", "Deploys contract with pk")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey}) => {
    const { main } = await lazyImport("./scripts/deploy-permit-library");
    await main(privateKey);
  });    
  
task("deploy-book-library-with-token", "Deploys contract with pk")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey}) => {
    const { main } = await lazyImport("./scripts/deploy-book-library-with-lib-token-permits");
    await main(privateKey);
  });    


subtask("print", "Prints a message")
  .addParam("message", "The message to print")
  .setAction(async (taskArgs) => {
    console.log(taskArgs.message);
  });

export default config;
