"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const hardhat_1 = require("hardhat");
const hardhat_2 = __importDefault(require("hardhat"));
async function main(_privateKey) {
    await hardhat_2.default.run('print', { message: `Private Key:  ${_privateKey}` });
    const selectedNetwork = hardhat_2.default.network.name;
    await hardhat_2.default.run('print', { message: `Deploying to network:  ${selectedNetwork}` });
    const wallet = new hardhat_1.ethers.Wallet(_privateKey, hardhat_1.ethers.provider); // New wallet with the privateKey passed from CLI as param
    await hardhat_2.default.run('print', { message: `Deploying contract with account: ${wallet.address}` });
    const BOOK_LIBRARY_FACTORY = await hardhat_1.ethers.getContractFactory("BookLibrary");
    const bookLibrary = await BOOK_LIBRARY_FACTORY.connect(wallet).deploy();
    await bookLibrary.deployed();
    await hardhat_2.default.run('print', { message: `The BookLibrary contract is deployed to ${bookLibrary.address}` });
    const owner = await bookLibrary.owner();
    await hardhat_2.default.run('print', { message: `The BookLibrary contract owner is ${owner}` });
}
exports.main = main;
