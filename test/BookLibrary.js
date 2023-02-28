"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const keccak256_1 = require("@ethersproject/keccak256");
const strings_1 = require("@ethersproject/strings");
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
describe("BookLibrary", function () {
    // Constants
    const BOOK_LIBRARY_CONTRACT_NAME = "BookLibrary";
    const INVALID_BOOK_KEY = (0, keccak256_1.keccak256)((0, strings_1.toUtf8Bytes)(""));
    const BOOK_NOT_ADDED_TITLE = "The great Gatsby";
    const BOOK_NOT_ADDED_KEY = (0, keccak256_1.keccak256)((0, strings_1.toUtf8Bytes)(BOOK_NOT_ADDED_TITLE));
    // Books
    const MOBY_DICK = "Moby Dick";
    const MOBY_DICK_KEY = (0, keccak256_1.keccak256)((0, strings_1.toUtf8Bytes)(MOBY_DICK));
    const ROBINSON_CRUSOE = "Robinson Crusoe";
    const FRANKENSTEIN = "Frankenstein";
    const HUCKLEBERRY = "The Adventures of Huckleberry Finn";
    // Error messages
    const OWNABLE_ERROR_MESSAGE = "Ownable: caller is not the owner";
    const INVALID_TITLE_ERROR = "Title is not valid";
    const BOOK_DOES_NOT_EXIST_ERROR = "The requested book does not exist.";
    const NO_MORE_AVAILABLE_COPIES_ERROR = "There are no more available copies of this book.";
    const BOOK_ALREADY_BORROWED_ERROR = "You have already borrowed this book.";
    const BOOK_NOT_BORROWED_ERROR = "You have not borrowed this book.";
    let bookLibraryFactory;
    let bookLibrary;
    let owner;
    let address1;
    let address2;
    let address3;
    // We define a fixtures to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployEmptyLibrary() {
        bookLibraryFactory = await hardhat_1.ethers.getContractFactory(BOOK_LIBRARY_CONTRACT_NAME);
        bookLibrary = await bookLibraryFactory.deploy();
        await bookLibrary.deployed();
        [owner, address1, address2, address3] = await hardhat_1.ethers.getSigners();
        return { bookLibrary, owner, address1, address2, address3 };
    }
    async function deployLibraryWithBooks() {
        bookLibraryFactory = await hardhat_1.ethers.getContractFactory(BOOK_LIBRARY_CONTRACT_NAME);
        bookLibrary = await bookLibraryFactory.deploy();
        await bookLibrary.deployed();
        [owner, address1, address2, address3] = await hardhat_1.ethers.getSigners();
        // Add 2 copies of Moby Dick
        await bookLibrary.addBook(MOBY_DICK);
        await bookLibrary.addBook(MOBY_DICK);
        // Add 2 copies of Robinson Crusoe
        await bookLibrary.addBook(ROBINSON_CRUSOE);
        await bookLibrary.addBook(ROBINSON_CRUSOE);
        // Add 1 copy of Frankenstein
        await bookLibrary.addBook(FRANKENSTEIN);
        return { bookLibrary, owner, address1, address2, address3 };
    }
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { bookLibrary, owner } = await (0, hardhat_network_helpers_1.loadFixture)(deployEmptyLibrary);
            (0, chai_1.expect)(await bookLibrary.owner()).to.equal(owner.address);
        });
        it("Should have 0 books after deployment", async function () {
            const { bookLibrary, owner } = await (0, hardhat_network_helpers_1.loadFixture)(deployEmptyLibrary);
            (0, chai_1.expect)(await bookLibrary.getNumberOfBooks()).to.equal(0);
        });
        // TODO all variables should have its default value. no borrowers, no books, etc
    });
    describe("Get book by title", function () {
        describe("Validations", function () {
            it("Should throw when trying to get a book with an empty title", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployEmptyLibrary);
                (0, chai_1.expect)(bookLibrary.getBookByTitle("")).to.be.revertedWith(INVALID_TITLE_ERROR);
            });
        });
        describe("Getting books", function () {
            it("Shouldn't find a book that wasn't added to the library", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                const storedBook = await bookLibrary.getBookByTitle(BOOK_NOT_ADDED_TITLE);
                (0, chai_1.expect)(storedBook.title).to.equal("");
                (0, chai_1.expect)(storedBook.copies).to.equal(0);
                (0, chai_1.expect)(storedBook.borrowers.length).to.equal(0);
            });
            it("Should find a book", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                const storedBook = await bookLibrary.getBookByTitle(MOBY_DICK);
                (0, chai_1.expect)(storedBook.title).to.equal(MOBY_DICK);
                (0, chai_1.expect)(storedBook.copies).to.equal(2);
                (0, chai_1.expect)(storedBook.borrowers.length).to.equal(0);
            });
        });
    });
    describe("Get book by key", function () {
        it("Shouldn't find a book with and empty title", async function () {
            const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
            // Book should be inserted without errors
            const storedBook = await bookLibrary.getBookByKey(INVALID_BOOK_KEY);
            (0, chai_1.expect)(storedBook.title).to.equal("");
            (0, chai_1.expect)(storedBook.copies).to.equal(0);
            (0, chai_1.expect)(storedBook.borrowers.length).to.equal(0);
        });
        it("Shouldn't find a book that wasn't added to the library", async function () {
            const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
            const storedBook = await bookLibrary.getBookByKey(BOOK_NOT_ADDED_KEY);
            (0, chai_1.expect)(storedBook.title).to.equal("");
            (0, chai_1.expect)(storedBook.copies).to.equal(0);
            (0, chai_1.expect)(storedBook.borrowers.length).to.equal(0);
        });
        it("Should find a book", async function () {
            const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
            const storedBook = await bookLibrary.getBookByKey(MOBY_DICK_KEY);
            (0, chai_1.expect)(storedBook.title).to.equal(MOBY_DICK);
            (0, chai_1.expect)(storedBook.copies).to.equal(2);
            (0, chai_1.expect)(storedBook.borrowers.length).to.equal(0);
        });
    });
    describe("Add Book", function () {
        describe("Validations", function () {
            it("Should throw when trying to add a book with an address different thant the owner", async function () {
                const { bookLibrary, owner, address1, address2, address3 } = await (0, hardhat_network_helpers_1.loadFixture)(deployEmptyLibrary);
                (0, chai_1.expect)(bookLibrary.connect(address1).addBook(MOBY_DICK)).to.be.revertedWith(OWNABLE_ERROR_MESSAGE);
            });
            it("Should throw when trying to add a book with an invalid/empty title", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployEmptyLibrary);
                (0, chai_1.expect)(bookLibrary.addBook("")).to.be.revertedWith(INVALID_TITLE_ERROR);
            });
        });
        describe("Add book to library successfully with the expected values", function () {
            it("Should add a new book to the library with the correct title, number of copies and empty borrowers if it wasn't present before", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployEmptyLibrary);
                // Book should be inserted without errors
                const tx = await bookLibrary.addBook(MOBY_DICK);
                (0, chai_1.expect)(tx.hash).to.be.a("string");
                // Book count should be 1 as the book was added for the first time
                (0, chai_1.expect)(await bookLibrary.getNumberOfBooks()).to.equal(1);
                // Retrieve book and validate that the values are correct
                const storedBook = await bookLibrary.getBookByTitle(MOBY_DICK);
                (0, chai_1.expect)(storedBook.title).to.equal(MOBY_DICK);
                (0, chai_1.expect)(storedBook.copies).to.equal(1);
                (0, chai_1.expect)(storedBook.borrowers.length).to.equal(0);
            });
            it("Should increment the number of copies if the book is already present in the library", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                // Book should be inserted without errors
                const tx = await bookLibrary.addBook(MOBY_DICK);
                (0, chai_1.expect)(tx.hash).to.be.a("string");
                // Book count should't be changed. 3 Is the count added in the fixture
                (0, chai_1.expect)(await bookLibrary.getNumberOfBooks()).to.equal(3);
                // Retrieve book and validate that the title is correct
                const storedBook = await bookLibrary.getBookByTitle(MOBY_DICK);
                (0, chai_1.expect)(storedBook.title).to.equal(MOBY_DICK);
                (0, chai_1.expect)(storedBook.copies).to.equal(3);
                (0, chai_1.expect)(storedBook.borrowers.length).to.equal(0);
            });
            it("Should add other books to the library with the correct title, number of copies and empty borrowers if it wasn't present before", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                // Book should be inserted without errors
                const tx = await bookLibrary.addBook(HUCKLEBERRY);
                (0, chai_1.expect)(tx.hash).to.be.a("string");
                // Book count should have been updated
                (0, chai_1.expect)(await bookLibrary.getNumberOfBooks()).to.equal(4);
                // Retrieve book and validate that the title is correct
                const huckleberry = await bookLibrary.getBookByTitle(HUCKLEBERRY);
                (0, chai_1.expect)(huckleberry.title).to.equal(HUCKLEBERRY);
                (0, chai_1.expect)(huckleberry.copies).to.equal(1);
                (0, chai_1.expect)(huckleberry.borrowers.length).to.equal(0);
            });
        });
        describe("Events", function () {
            it("Emit a NewBookAdded event when adding for the first time", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                await (0, chai_1.expect)(bookLibrary.addBook(HUCKLEBERRY))
                    .to.emit(bookLibrary, "NewBookAdded")
                    .withArgs(HUCKLEBERRY);
            });
            it("Emit a BookCopyAdded event when book is already in the library", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                await (0, chai_1.expect)(bookLibrary.addBook(FRANKENSTEIN))
                    .to.emit(bookLibrary, "BookCopyAdded")
                    .withArgs(FRANKENSTEIN, 2);
            });
        });
    });
    describe("Borrow book", function () {
        describe("Validations", function () {
            it("Should throw when trying to borrow a book with an empty title", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                (0, chai_1.expect)(bookLibrary.borrowBook("")).to.be.revertedWith(INVALID_TITLE_ERROR);
            });
            it("Should throw when borrowing a book that doesn't exist", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                (0, chai_1.expect)(bookLibrary.borrowBook(BOOK_NOT_ADDED_TITLE)).to.be.revertedWith(BOOK_DOES_NOT_EXIST_ERROR);
            });
            it("Should throw when there are no more available copies", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                // Borrow first copy with address1
                const tx = await bookLibrary.connect(address1).borrowBook(FRANKENSTEIN);
                (0, chai_1.expect)(tx.hash).to.be.a("string");
                // It should revert given there were only two available copies
                (0, chai_1.expect)(bookLibrary.connect(address3).borrowBook(FRANKENSTEIN)).to.be.revertedWith(NO_MORE_AVAILABLE_COPIES_ERROR);
            });
            it("Should throw when trying to borrow multiple copies", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                // Borrow first copy with address1
                const tx = await bookLibrary.connect(address1).borrowBook(ROBINSON_CRUSOE);
                (0, chai_1.expect)(tx.hash).to.be.a("string");
                (0, chai_1.expect)(bookLibrary.connect(address1).borrowBook(ROBINSON_CRUSOE)).to.be.revertedWith(BOOK_ALREADY_BORROWED_ERROR);
            });
        });
        describe("Borrow a book", function () {
            it("Should be able to borrow a book that exists in the library and has available copies", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                // Get the book and check that the number of copies is decreased
                const bookBeforeBorrowing = await bookLibrary.getBookByTitle(FRANKENSTEIN);
                (0, chai_1.expect)(bookBeforeBorrowing.title).to.equal(FRANKENSTEIN);
                (0, chai_1.expect)(bookBeforeBorrowing.copies).to.equal(1);
                (0, chai_1.expect)(bookBeforeBorrowing.borrowers.length).to.equal(0);
                // Borrow the book
                const tx = await bookLibrary.connect(address1).borrowBook(FRANKENSTEIN);
                (0, chai_1.expect)(tx.hash).to.be.a("string");
                // Get the book and check that the number of copies is decreased
                const bookAfterBorrowing = await bookLibrary.getBookByTitle(FRANKENSTEIN);
                (0, chai_1.expect)(bookAfterBorrowing.title).to.equal(FRANKENSTEIN);
                (0, chai_1.expect)(bookAfterBorrowing.copies).to.equal(0);
                const borrowers = bookAfterBorrowing.borrowers;
                (0, chai_1.expect)(borrowers.length).to.equal(1);
                (0, chai_1.expect)(await borrowers[0]).to.equal(address1.address);
            });
        });
        describe("Events", function () {
            it("Emit a BookBorrowed event when borrowing a copy of a book", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                await (0, chai_1.expect)(bookLibrary.connect(address2).borrowBook(MOBY_DICK))
                    .to.emit(bookLibrary, "BookBorrowed")
                    .withArgs(MOBY_DICK, address2.address, 1);
            });
        });
    });
    describe("Return book", function () {
        describe("Validations", function () {
            it("Should throw when trying to return a book with an empty title", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                (0, chai_1.expect)(bookLibrary.returnBook("")).to.be.revertedWith(INVALID_TITLE_ERROR);
            });
            it("Should throw when returning a book that doesn't exist", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                (0, chai_1.expect)(bookLibrary.returnBook(BOOK_NOT_ADDED_TITLE)).to.be.revertedWith(BOOK_DOES_NOT_EXIST_ERROR);
            });
            it("Should throw when trying to return a book that wasn't borrowed before", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                (0, chai_1.expect)(bookLibrary.connect(address2).returnBook(ROBINSON_CRUSOE)).to.be.revertedWith(BOOK_NOT_BORROWED_ERROR);
            });
        });
        describe("Return a book", function () {
            it("Should be able to return a book that was previously borrowed by the same address", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                // Borrow the book
                const tx1 = await bookLibrary.connect(address3).borrowBook(FRANKENSTEIN);
                (0, chai_1.expect)(tx1.hash).to.be.a("string");
                // Get the book and check that the number of copies is decreased
                const bookBeforeReturning = await bookLibrary.getBookByTitle(FRANKENSTEIN);
                (0, chai_1.expect)(bookBeforeReturning.title).to.equal(FRANKENSTEIN);
                (0, chai_1.expect)(bookBeforeReturning.copies).to.equal(0);
                let borrowers = bookBeforeReturning.borrowers;
                (0, chai_1.expect)(borrowers.length).to.equal(1);
                (0, chai_1.expect)(await borrowers[0]).to.equal(address3.address);
                // Return the book
                const tx2 = await bookLibrary.connect(address3).returnBook(FRANKENSTEIN);
                (0, chai_1.expect)(tx2.hash).to.be.a("string");
                // Get the book and check that the number of copies is decreased
                const bookAfterReturning = await bookLibrary.getBookByTitle(FRANKENSTEIN);
                (0, chai_1.expect)(bookAfterReturning.title).to.equal(FRANKENSTEIN);
                (0, chai_1.expect)(bookAfterReturning.copies).to.equal(1);
                // Borrowers should be changed after returning a book
                borrowers = bookAfterReturning.borrowers;
                (0, chai_1.expect)(borrowers.length).to.equal(1);
                (0, chai_1.expect)(await borrowers[0]).to.equal(address3.address);
            });
        });
        describe("Events", function () {
            it("Emit a BookReturned event when returning a copy of a book", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                // Borrow the book
                const tx1 = await bookLibrary.connect(address1).borrowBook(MOBY_DICK);
                (0, chai_1.expect)(tx1.hash).to.be.a("string");
                // return the book
                await (0, chai_1.expect)(bookLibrary.connect(address1).returnBook(MOBY_DICK))
                    .to.emit(bookLibrary, "BookReturned")
                    .withArgs(MOBY_DICK, address1.address, 2);
            });
        });
    });
    describe("Get borrowers", function () {
        describe("Validations", function () {
            it("Should throw when trying to get the borrowers of a book with an empty title", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                (0, chai_1.expect)(bookLibrary.getBorrowers("")).to.be.revertedWith(INVALID_TITLE_ERROR);
            });
            it("Should throw when trying to get the borrowers of a book that doesn't exist", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                (0, chai_1.expect)(bookLibrary.getBorrowers(BOOK_NOT_ADDED_TITLE)).to.be.revertedWith(BOOK_DOES_NOT_EXIST_ERROR);
            });
        });
        describe("Get borrowers", function () {
            it("Should return an empty array if no book was borrowed", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                const borrowers = await bookLibrary.getBorrowers(ROBINSON_CRUSOE);
                (0, chai_1.expect)((await bookLibrary.getBorrowers(ROBINSON_CRUSOE)).length).to.equal(0);
            });
            it("Should return the borrowers after borrowing a book", async function () {
                const { bookLibrary } = await (0, hardhat_network_helpers_1.loadFixture)(deployLibraryWithBooks);
                // Borrow the book
                const tx = await bookLibrary.connect(address3).borrowBook(ROBINSON_CRUSOE);
                (0, chai_1.expect)(tx.hash).to.be.a("string");
                const borrowers = await bookLibrary.getBorrowers(ROBINSON_CRUSOE);
                (0, chai_1.expect)(borrowers.length).to.equal(1);
                (0, chai_1.expect)(borrowers[0]).to.equal(address3.address);
            });
        });
    });
});
