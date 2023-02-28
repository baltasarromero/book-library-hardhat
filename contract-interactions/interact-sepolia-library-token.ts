import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const LibraryTokenArtifact = require("../artifacts/contracts/Lib.sol/Lib.json");

import { BigNumber, BigNumberish, Contract, Signer, Wallet } from "ethers";
import { Lib } from "../typechain-types";
import { BytesLike } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { InfuraProvider, Provider } from "@ethersproject/providers";
import { ContractTransaction, ContractReceipt } from "@ethersproject/contracts";
import { PromiseOrValue } from "../typechain-types/common";

let libraryToken: Lib;

async function mint(recipient: Wallet, amount: BigNumber) {
    const mintTokensTx: ContractTransaction = await libraryToken.connect(recipient).mint(recipient.address, amount);
    const mintTokensTxReceipt: ContractReceipt = await mintTokensTx.wait();

    if (mintTokensTxReceipt.status != 1) {
        console.log("Couldn't mint tokens");
        return;
    }
}

async function burn(title: string) {
  /*   const addBookTransaction: ContractTransaction = await bookLibrary.addBook(title);
    const addBookTransactionReceipt: ContractReceipt = await addBookTransaction.wait();

    if (addBookTransactionReceipt.status != 1) {
        console.log("Couldn't add a book");
        return;
    } */
}


async function checkBalance() {
    /* const bookCount: number = await (await bookLibrary.getNumberOfBooks()).toNumber();
    console.log("Current book count:", bookCount.toString());
     */
}



const interactionWithContract = async function () {
    const provider: InfuraProvider = new InfuraProvider("sepolia", process.env.INFURA_PROJECT_ID);

    const wallet1: Wallet = new Wallet(
        process.env.SEPOLIA_WALLET_ACCOUNT_2 || "",
        provider
    );

    const wallet2: Wallet = new Wallet(
        process.env.GOERLI_WALLET_2_PK || "",
        provider
    );

    libraryToken = <Lib> new Contract(
        process.env.SEPOLIA_LIBRARY_TOKEN_ADDRESS || "",
        LibraryTokenArtifact.abi,
        wallet1
    );

    // MINT TOKENS FOR ACCOUNT 2
    console.log("minting tokens");
    await mint(wallet1, BigNumber.from("1000000000"));
    console.log("Minted tokens");
};

interactionWithContract();
