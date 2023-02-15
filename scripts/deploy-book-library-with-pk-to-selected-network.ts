import { ethers } from "hardhat";
import hre from 'hardhat';

export async function main( _privateKey: string) {
  await hre.run('print', { message: `Private Key:  ${_privateKey}` });
  const selectedNetwork: string = hre.network.name;
  await hre.run('print', { message: `Deploying to network:  ${selectedNetwork}` });
  const wallet = new ethers.Wallet(_privateKey, ethers.provider); // New wallet with the privateKey passed from CLI as param
  await hre.run('print', { message: `Deploying contract with account: ${wallet.address}` });
  const BOOK_LIBRARY_FACTORY = await ethers.getContractFactory("BookLibrary");
  const bookLibrary = await BOOK_LIBRARY_FACTORY.connect(wallet).deploy();
  await bookLibrary.deployed();
  await hre.run('print', { message: `The BookLibrary contract is deployed to ${bookLibrary.address}` });  
  const owner = await bookLibrary.owner();
  await hre.run('print', { message: `The BookLibrary contract owner is ${owner}` });
}