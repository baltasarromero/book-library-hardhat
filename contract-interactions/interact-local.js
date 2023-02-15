"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "../.env" });
const BookLibraryArtifact = require("../artifacts/contracts/BookLibrary.sol/BookLibrary.json");
const ethers_1 = require("ethers");
const keccak256_1 = require("@ethersproject/keccak256");
const strings_1 = require("@ethersproject/strings");
const providers_1 = require("@ethersproject/providers");
const FIRST_BOOK_TITLE = "100 years of solitude";
const SECOND_BOOK_TITLE = "War and peace";
let bookLibrary;
async function addBook(title) {
    const addBookTransaction = await bookLibrary.addBook(title);
    const addBookTransactionReceipt = await addBookTransaction.wait();
    if (addBookTransactionReceipt.status != 1) {
        console.log("Couldn't add a book");
        return;
    }
}
async function checkAllBooks() {
    const bookCount = await (await bookLibrary.getNumberOfBooks()).toNumber();
    console.log("Current book count:", bookCount.toString());
    // Get all the keys
    // We assume that the bookCount is not a BigNumber otherwise this for loop would be too costly
    for (let index = 0; index < bookCount; index++) {
        const bookKey = await bookLibrary.bookKeys(index);
        const book = await bookLibrary.getBookByKey(bookKey);
        await console.log(`Book ${index + 1} Title: ${book.title}, number of copies: ${book.copies.toString()}`);
    }
}
async function borrowBook(title, signer) {
    const borrowTransaction = await bookLibrary.connect(signer).borrowBook(title);
    const borrowTransactionReceipt = await borrowTransaction.wait();
    if (borrowTransactionReceipt.status != 1) {
        console.log("Borrow transaction was not successful");
    }
}
async function hasBorrowedBook(borrower, title) {
    // Generate book key
    const bookKey = (0, keccak256_1.keccak256)((0, strings_1.toUtf8Bytes)(title));
    const borrowerAddress = await borrower.getAddress();
    const isBorrowed = await bookLibrary.borrowedBook(borrowerAddress, bookKey);
    if (isBorrowed) {
        console.log(`Address ${borrowerAddress} has borrowed book ${title}`);
    }
    else {
        console.log(`Address ${borrowerAddress} has not borrowed book ${title}`);
    }
}
async function returnBook(returner, title) {
    const returnTransaction = await bookLibrary.connect(returner).returnBook(title);
    const returnTransactionReceipt = await returnTransaction.wait();
    if (returnTransactionReceipt.status != 1) {
        console.log("Return transaction was not successful");
    }
    else {
        console.log(`A copy of ${title} was returned successfully`);
    }
}
async function isBookAvailable(title) {
    const storedBook = await bookLibrary.getBookByTitle(title);
    // We assume that the number of copies won't be a bignumber (not exceeed JS's number limits)
    const availableCopies = (await storedBook.copies).toNumber();
    if (availableCopies == 0) {
        console.log(`There are no more available copies of "${title}" in the library`);
    }
    else if (availableCopies == 1) {
        console.log(`There is only one available copy of "${title}" in the library`);
    }
    else {
        console.log(`There are ${availableCopies.toString()} copies available of "${title}" in the library`);
    }
}
const interactionWithContract = async function () {
    const provider = new providers_1.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new ethers_1.Wallet(process.env.HH_ACCOUNT_0_PK || "", provider);
    const accounts = await provider.listAccounts();
    bookLibrary = new ethers_1.Contract(process.env.BOOK_LIBRARY_LOCAL_ADDRESS || "", BookLibraryArtifact.abi, wallet);
    // add first book
    await addBook(FIRST_BOOK_TITLE);
    // add second book
    await addBook(SECOND_BOOK_TITLE);
    // Check all available books
    await checkAllBooks();
    // Signer 1
    const signer = await provider.getSigner(accounts[3]);
    // Check the availability of the book before borrowing
    await isBookAvailable(FIRST_BOOK_TITLE);
    // Borrow a book
    await borrowBook(FIRST_BOOK_TITLE, signer);
    // Check that it is borrowed
    await hasBorrowedBook(signer, FIRST_BOOK_TITLE);
    // Check the availability of the book after borrowing
    await isBookAvailable(FIRST_BOOK_TITLE);
    // Return the book
    await returnBook(signer, FIRST_BOOK_TITLE);
    // Check the availability of the books after returning book 1
    await isBookAvailable(FIRST_BOOK_TITLE);
    await isBookAvailable(SECOND_BOOK_TITLE);
};
interactionWithContract();
