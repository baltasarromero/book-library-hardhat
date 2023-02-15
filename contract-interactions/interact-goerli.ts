import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const BookLibraryArtifact = require("../artifacts/contracts/BookLibrary.sol/BookLibrary.json");

import { BigNumber, Contract, Wallet } from "ethers";
import { BookLibrary } from "../typechain-types";
import { BytesLike } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { JsonRpcSigner, InfuraProvider } from "@ethersproject/providers";
import { ContractTransaction, ContractReceipt } from "@ethersproject/contracts";

const FIRST_BOOK_TITLE: string = "100 years of solitude";
const SECOND_BOOK_TITLE: string = "War and peace";
let bookLibrary: BookLibrary;

async function addBook(title: string) {
    const addBookTransaction: ContractTransaction = await bookLibrary.addBook(title);
    const addBookTransactionReceipt: ContractReceipt = await addBookTransaction.wait();

    if (addBookTransactionReceipt.status != 1) {
        console.log("Couldn't add a book");
        return;
    }
}

async function checkAllBooks() {
    const bookCount: number = await (await bookLibrary.getNumberOfBooks()).toNumber();
    console.log("Current book count:", bookCount.toString());
    
    // Get all the keys
    // We assume that the bookCount is not a BigNumber otherwise this for loop would be too costly
    for (let index= 0; index < bookCount; index++) {
        const bookKey = await bookLibrary.bookKeys(index);
        const book = await bookLibrary.getBookByKey(bookKey);

        await console.log(
            `Book ${index + 1} Title: ${book.title}, number of copies: ${
                book.copies.toString()
            }`
        );
    }
}

async function borrowBook(title: string, wallet: Wallet) {
    const borrowTransaction: ContractTransaction = await bookLibrary.connect(wallet).borrowBook(title);
    const borrowTransactionReceipt: ContractReceipt = await borrowTransaction.wait();

    if (borrowTransactionReceipt.status != 1) {
        console.log("Borrow transaction was not successful");
    }
}     

async function hasBorrowedBook(    borrower: Wallet,
    title: string
) {
    // Generate book key
    const bookKey: BytesLike = keccak256(toUtf8Bytes(title));

    const borrowerAddress: string = await borrower.getAddress();

    const isBorrowed: boolean = await bookLibrary.borrowedBook(borrowerAddress, bookKey);

    if (isBorrowed) {
        console.log(`Address ${borrowerAddress} has borrowed book ${title}`);
    } else {
        console.log(
            `Address ${borrowerAddress} has not borrowed book ${title}`
        );
    }
}

async function returnBook(returner: Wallet, title: string) {
    const returnTransaction: ContractTransaction = await bookLibrary.connect(returner).returnBook(title);
    const returnTransactionReceipt: ContractReceipt = await returnTransaction.wait();

    if (returnTransactionReceipt.status != 1) {
        console.log("Return transaction was not successful");
    } else {
        console.log(`A copy of ${title} was returned successfully`);
    }
}

async function isBookAvailable(title: string) {
    const storedBook: BookLibrary.BookStruct = await bookLibrary.getBookByTitle(title);
    // We assume that the number of copies won't be a bignumber (not exceeed JS's number limits)
    const availableCopies: number = (<BigNumber> await storedBook.copies).toNumber();

    if (availableCopies == 0) {
        console.log(`There are no more available copies of "${title}" in the library`);
    } else if (availableCopies == 1) {
        console.log(`There is only one available copy of "${title}" in the library`);
    } else {
        console.log(`There are ${availableCopies.toString()} copies available of "${title}" in the library`);
    } 
}

const interactionWithContract = async function () {
    const provider: InfuraProvider = new InfuraProvider("goerli", process.env.INFURA_PROJECT_ID);

    const wallet1: Wallet = new Wallet(
        process.env.GOERLI_WALLET_1_PK || "",
        provider
    );

    const wallet2: Wallet = new Wallet(
        process.env.GOERLI_WALLET_2_PK || "",
        provider
    );

    bookLibrary = <BookLibrary> new Contract(
        process.env.BOOK_LIBRARY_GOERLI_ADDRESS || "",
        BookLibraryArtifact.abi,
        wallet1
    );

    // add first book
    await addBook(FIRST_BOOK_TITLE);

    // add second book
    await addBook(SECOND_BOOK_TITLE);

    // Check all available books
    await checkAllBooks();

     
    // Check the availability of the book before borrowing
    await isBookAvailable(FIRST_BOOK_TITLE);

    // Borrow a book
    await borrowBook(FIRST_BOOK_TITLE, wallet2);

    // Check that it is borrowed
    await hasBorrowedBook(wallet2, FIRST_BOOK_TITLE);

    // Check the availability of the book after borrowing
    await isBookAvailable(FIRST_BOOK_TITLE);
    
    // Return the book
    await returnBook(wallet2, FIRST_BOOK_TITLE);

    // Check the availability of the books after returning book 1
    await isBookAvailable(FIRST_BOOK_TITLE);
    await isBookAvailable(SECOND_BOOK_TITLE);    

};

interactionWithContract();
