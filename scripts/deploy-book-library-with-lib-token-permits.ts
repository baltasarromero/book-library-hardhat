import { ethers } from "hardhat";
import hre from 'hardhat';

export async function main( _privateKey: string) {
  await hre.run('print', { message: `Private Key:  ${_privateKey}` });
  const selectedNetwork: string = hre.network.name;
  await hre.run('print', { message: `Deploying to network:  ${selectedNetwork}` });
  const wallet = new ethers.Wallet(_privateKey, ethers.provider); // New wallet with the privateKey passed from CLI as param
  await hre.run('print', { message: `Deploying contract with account: ${wallet.address}` });
  const BOOK_LIBRARY_FACTORY = await ethers.getContractFactory("BookLibraryWithToken");
  const libTokenWithPermitsAddress = "0x5EeA5bC9f3c1F63136B7a194E0aaA6246043c2CB";
  const bookLibrary = await BOOK_LIBRARY_FACTORY.connect(wallet).deploy(libTokenWithPermitsAddress);
  await bookLibrary.deployed();
  await hre.run('print', { message: `The BookLibraryWithToken contract is deployed to ${bookLibrary.address}` });  
  const owner = await bookLibrary.owner();
  await hre.run('print', { message: `The BookLibraryWithToken contract owner is ${owner}` });
}