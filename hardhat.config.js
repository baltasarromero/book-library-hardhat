"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const config_1 = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
const lazyImport = async (module) => {
    var _a;
    return await (_a = module, Promise.resolve().then(() => __importStar(require(_a))));
};
const config = {
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
            accounts: [],
        },
        sepolia: {
            url: process.env.INFURA_SEPOLIA_URL || "",
            chainId: 11155111,
            accounts: [],
        },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at <https://etherscan.io/>
        apiKey: process.env.ETHERSCAN_API_KEY || ""
    }
};
(0, config_1.task)("deploy-with-pk-to-selected-network", "Deploys contract with pk")
    .addParam("privateKey", "Please provide the private key")
    .setAction(async ({ privateKey }) => {
    const { main } = await lazyImport("./scripts/deploy-book-library-with-pk-to-selected-network");
    await main(privateKey);
});
(0, config_1.subtask)("print", "Prints a message")
    .addParam("message", "The message to print")
    .setAction(async (taskArgs) => {
    console.log(taskArgs.message);
});
exports.default = config;
