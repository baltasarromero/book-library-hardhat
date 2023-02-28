import { ethers } from "hardhat";
import hre from 'hardhat';

export async function main( _privateKey: string) {
  await hre.run('print', { message: `Private Key:  ${_privateKey}` });
  const selectedNetwork: string = hre.network.name;
  await hre.run('print', { message: `Deploying to network:  ${selectedNetwork}` });
  const wallet = new ethers.Wallet(_privateKey, ethers.provider); // New wallet with the privateKey passed from CLI as param
  await hre.run('print', { message: `Deploying Lib contract with account: ${wallet.address}` });
  const LIBRARY_PERMIT_CONTRACT_FACTORY = await ethers.getContractFactory("Lib");
  const permitLibrary = await LIBRARY_PERMIT_CONTRACT_FACTORY.connect(wallet).deploy();
  await permitLibrary.deployed();
  await hre.run('print', { message: `The Library Token contract is deployed to ${permitLibrary.address}` });  
}