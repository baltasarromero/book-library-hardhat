import { ethers } from "hardhat";
import hre from 'hardhat';

export async function main( _privateKey: string) {
  await hre.run('print', { message: `Private Key:  ${_privateKey}` });
  const selectedNetwork: string = hre.network.name;
  await hre.run('print', { message: `Deploying to network:  ${selectedNetwork}` });
  const wallet = new ethers.Wallet(_privateKey, ethers.provider); // New wallet with the privateKey passed from CLI as param
  await hre.run('print', { message: `Deploying Lib contract with account: ${wallet.address}` });
  const LIBRARY_TOKEN_CONTRACT_FACTORY = await ethers.getContractFactory("LibraryToken");
  const libraryToken = await LIBRARY_TOKEN_CONTRACT_FACTORY.connect(wallet).deploy();
  await libraryToken.deployed();
  await hre.run('print', { message: `The Library Token contract is deployed to ${libraryToken.address}` });  
}