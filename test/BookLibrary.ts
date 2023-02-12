import { BookLibrary } from "../typechain-types/";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { BytesLike } from "@ethersproject/bytes";
import { ContractTransaction } from "@ethersproject/contracts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BookLibrary", function () {
    // Constants
    const BOOK_LIBRARY_CONTRACT_NAME: string = "BookLibrary";
    const INVALID_BOOK_KEY: BytesLike = keccak256(toUtf8Bytes(""));
    const BOOK_NOT_ADDED_TITLE: string = "The great Gatsby";
    const BOOK_NOT_ADDED_KEY: BytesLike = keccak256(
        toUtf8Bytes(BOOK_NOT_ADDED_TITLE)
    );

    // Books
    const MOBY_DICK: string = "Moby Dick";
    const MOBY_DICK_KEY: BytesLike = keccak256(toUtf8Bytes(MOBY_DICK));
    const ROBINSON_CRUSOE: string = "Robinson Crusoe";
    const FRANKENSTEIN: string = "Frankenstein";
    const HUCKLEBERRY: string = "The Adventures of Huckleberry Finn";

    // Error messages
    const OWNABLE_ERROR_MESSAGE: string = "Ownable: caller is not the owner";
    const INVALID_TITLE_ERROR: string = "Title is not valid";
    const BOOK_DOES_NOT_EXIST_ERROR: string =
        "The requested book does not exist.";
    const NO_MORE_AVAILABLE_COPIES_ERROR: string =
        "There are no more available copies of this book.";
    const BOOK_ALREADY_BORROWED_ERROR: string =
        "You have already borrowed this book.";
    const BOOK_NOT_BORROWED_ERROR = "You have not borrowed this book.";

    let bookLibraryFactory;
    let bookLibrary: BookLibrary;
    let owner: SignerWithAddress;
    let address1: SignerWithAddress;
    let address2: SignerWithAddress;
    let address3: SignerWithAddress;

    // We define a fixtures to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployEmptyLibrary() {
        bookLibraryFactory = await ethers.getContractFactory(
            BOOK_LIBRARY_CONTRACT_NAME
        );

        bookLibrary = <BookLibrary>await bookLibraryFactory.deploy();
        await bookLibrary.deployed();
        [owner, address1, address2, address3] = await ethers.getSigners();

        return { bookLibrary, owner, address1, address2, address3 };
    }

    async function deployLibraryWithBooks() {
        bookLibraryFactory = await ethers.getContractFactory(
            BOOK_LIBRARY_CONTRACT_NAME
        );

        bookLibrary = <BookLibrary>await bookLibraryFactory.deploy();
        await bookLibrary.deployed();
        [owner, address1, address2, address3] = await ethers.getSigners();

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
            const { bookLibrary, owner } = await loadFixture(
                deployEmptyLibrary
            );
            expect(await bookLibrary.owner()).to.equal(owner.address);
        });

        it("Should have 0 books after deployment", async function () {
            const { bookLibrary, owner } = await loadFixture(
                deployEmptyLibrary
            );
            expect(await bookLibrary.getNumberOfBooks()).to.equal(0);
        });

        // TODO all variables should have its default value. no borrowers, no books, etc
    });
    
    describe("Get book by title", function () {
        describe("Validations", function () {
            it("Should throw when trying to get a book with an empty title", async function () {
                const { bookLibrary } = await loadFixture(deployEmptyLibrary);
                expect(bookLibrary.getBookByTitle("")).to.be.revertedWith(
                    INVALID_TITLE_ERROR
                );
            });
        });

        describe("Getting books", function () {
            it("Shouldn't find a book that wasn't added to the library", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                const storedBook: BookLibrary.BookStruct =
                    await bookLibrary.getBookByTitle(BOOK_NOT_ADDED_TITLE);

                expect(storedBook.title).to.equal("");
                expect(storedBook.copies).to.equal(0);
                expect(storedBook.borrowers.length).to.equal(0);
            });

            it("Should find a book", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                const storedBook: BookLibrary.BookStruct =
                    await bookLibrary.getBookByTitle(MOBY_DICK);

                expect(storedBook.title).to.equal(MOBY_DICK);
                expect(storedBook.copies).to.equal(2);
                expect(storedBook.borrowers.length).to.equal(0);
            });
        });
    });

    describe("Get book by key", function () {
        it("Shouldn't find a book with and empty title", async function () {
            const { bookLibrary } = await loadFixture(deployLibraryWithBooks);

            // Book should be inserted without errors
            const storedBook = await bookLibrary.getBookByKey(INVALID_BOOK_KEY);

            expect(storedBook.title).to.equal("");
            expect(storedBook.copies).to.equal(0);
            expect(storedBook.borrowers.length).to.equal(0);
        });

        it("Shouldn't find a book that wasn't added to the library", async function () {
            const { bookLibrary } = await loadFixture(deployLibraryWithBooks);

            const storedBook: BookLibrary.BookStruct =
                await bookLibrary.getBookByKey(BOOK_NOT_ADDED_KEY);

            expect(storedBook.title).to.equal("");
            expect(storedBook.copies).to.equal(0);
            expect(storedBook.borrowers.length).to.equal(0);
        });

        it("Should find a book", async function () {
            const { bookLibrary } = await loadFixture(deployLibraryWithBooks);

            const storedBook: BookLibrary.BookStruct =
                await bookLibrary.getBookByKey(MOBY_DICK_KEY);

            expect(storedBook.title).to.equal(MOBY_DICK);
            expect(storedBook.copies).to.equal(2);
            expect(storedBook.borrowers.length).to.equal(0);
        });
    });

    describe("Add Book", function () {
        describe("Validations", function () {
            it("Should throw when trying to add a book with an address different thant the owner", async function () {
                const { bookLibrary, owner, address1, address2, address3 } =
                    await loadFixture(deployEmptyLibrary);
                expect(
                    bookLibrary.connect(address1).addBook(MOBY_DICK)
                ).to.be.revertedWith(OWNABLE_ERROR_MESSAGE);
            });

            it("Should throw when trying to add a book with an invalid/empty title", async function () {
                const { bookLibrary } = await loadFixture(deployEmptyLibrary);
                expect(bookLibrary.addBook("")).to.be.revertedWith(
                    INVALID_TITLE_ERROR
                );
            });
        });

        describe("Add book to library successfully with the expected values", function () {
            it("Should add a new book to the library with the correct title, number of copies and empty borrowers if it wasn't present before", async function () {
                const { bookLibrary } = await loadFixture(deployEmptyLibrary);
                // Book should be inserted without errors
                const tx: ContractTransaction = await bookLibrary.addBook(MOBY_DICK);
                expect(tx.hash).to.be.a("string");

                // Book count should be 1 as the book was added for the first time
                expect(await bookLibrary.getNumberOfBooks()).to.equal(1);

                // Retrieve book and validate that the values are correct
                const storedBook = await bookLibrary.getBookByTitle(MOBY_DICK);
                expect(storedBook.title).to.equal(MOBY_DICK);
                expect(storedBook.copies).to.equal(1);
                expect(storedBook.borrowers.length).to.equal(0);
            });

            it("Should increment the number of copies if the book is already present in the library", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );
                // Book should be inserted without errors
                const tx: ContractTransaction = await bookLibrary.addBook(MOBY_DICK);
                expect(tx.hash).to.be.a("string");

                // Book count should't be changed. 3 Is the count added in the fixture
                expect(await bookLibrary.getNumberOfBooks()).to.equal(3);

                // Retrieve book and validate that the title is correct
                const storedBook: BookLibrary.BookStruct =
                    await bookLibrary.getBookByTitle(MOBY_DICK);
                expect(storedBook.title).to.equal(MOBY_DICK);
                expect(storedBook.copies).to.equal(3);
                expect(storedBook.borrowers.length).to.equal(0);
            });

            it("Should add other books to the library with the correct title, number of copies and empty borrowers if it wasn't present before", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );
                // Book should be inserted without errors
                const tx: ContractTransaction = await bookLibrary.addBook(HUCKLEBERRY);
                expect(tx.hash).to.be.a("string");

                // Book count should have been updated
                expect(await bookLibrary.getNumberOfBooks()).to.equal(4);

                // Retrieve book and validate that the title is correct
                const huckleberry = await bookLibrary.getBookByTitle(
                    HUCKLEBERRY
                );
                expect(huckleberry.title).to.equal(HUCKLEBERRY);
                expect(huckleberry.copies).to.equal(1);
                expect(huckleberry.borrowers.length).to.equal(0);
            });
        });

        describe("Events", function () {
            it("Emit a NewBookAdded event when adding for the first time", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                await expect(bookLibrary.addBook(HUCKLEBERRY))
                    .to.emit(bookLibrary, "NewBookAdded")
                    .withArgs(HUCKLEBERRY);
            });

            it("Emit a BookCopyAdded event when book is already in the library", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                await expect(bookLibrary.addBook(FRANKENSTEIN))
                    .to.emit(bookLibrary, "BookCopyAdded")
                    .withArgs(FRANKENSTEIN, 2);
            });
        });
    });

    describe("Borrow book", function () {
        describe("Validations", function () {
            it("Should throw when trying to borrow a book with an empty title", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );
                expect(bookLibrary.borrowBook("")).to.be.revertedWith(
                    INVALID_TITLE_ERROR
                );
            });

            it("Should throw when borrowing a book that doesn't exist", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                expect(
                    bookLibrary.borrowBook(BOOK_NOT_ADDED_TITLE)
                ).to.be.revertedWith(BOOK_DOES_NOT_EXIST_ERROR);
            });

            it("Should throw when there are no more available copies", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                // Borrow first copy with address1
                const tx: ContractTransaction = await bookLibrary.connect(address1).borrowBook(FRANKENSTEIN);
                expect(tx.hash).to.be.a("string");

                // It should revert given there were only two available copies
                expect(
                    bookLibrary.connect(address3).borrowBook(FRANKENSTEIN)
                ).to.be.revertedWith(NO_MORE_AVAILABLE_COPIES_ERROR);
            });

            it("Should throw when trying to borrow multiple copies", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                // Borrow first copy with address1
                const tx: ContractTransaction = await bookLibrary.connect(address1).borrowBook(ROBINSON_CRUSOE);
                expect(tx.hash).to.be.a("string");

                expect(
                    bookLibrary.connect(address1).borrowBook(ROBINSON_CRUSOE)
                ).to.be.revertedWith(BOOK_ALREADY_BORROWED_ERROR);
            });
        });

        describe("Borrow a book", function () {
            it("Should be able to borrow a book that exists in the library and has available copies", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                // Get the book and check that the number of copies is decreased
                const bookBeforeBorrowing: BookLibrary.BookStruct =
                    await bookLibrary.getBookByTitle(FRANKENSTEIN);
                expect(bookBeforeBorrowing.title).to.equal(FRANKENSTEIN);
                expect(bookBeforeBorrowing.copies).to.equal(1);
                expect(bookBeforeBorrowing.borrowers.length).to.equal(0);

                // Borrow the book
                const tx: ContractTransaction = await bookLibrary.connect(address1).borrowBook(FRANKENSTEIN);
                expect(tx.hash).to.be.a("string");

                // Get the book and check that the number of copies is decreased
                const bookAfterBorrowing: BookLibrary.BookStruct =
                    await bookLibrary.getBookByTitle(FRANKENSTEIN);
                expect(bookAfterBorrowing.title).to.equal(FRANKENSTEIN);
                expect(bookAfterBorrowing.copies).to.equal(0);

                const borrowers = bookAfterBorrowing.borrowers;
                expect(borrowers.length).to.equal(1);
                expect(await borrowers[0]).to.equal(address1.address);
            });
        });

        describe("Events", function () {
            it("Emit a BookBorrowed event when borrowing a copy of a book", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                await expect(
                    bookLibrary.connect(address2).borrowBook(MOBY_DICK)
                )
                    .to.emit(bookLibrary, "BookBorrowed")
                    .withArgs(MOBY_DICK, address2.address, 1);
            });
        });
    });

    describe("Return book", function () {
        describe("Validations", function () {
            it("Should throw when trying to return a book with an empty title", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );
                expect(bookLibrary.returnBook("")).to.be.revertedWith(
                    INVALID_TITLE_ERROR
                );
            });

            it("Should throw when returning a book that doesn't exist", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                expect(
                    bookLibrary.returnBook(BOOK_NOT_ADDED_TITLE)
                ).to.be.revertedWith(BOOK_DOES_NOT_EXIST_ERROR);
            });

            it("Should throw when trying to return a book that wasn't borrowed before", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                expect(
                    bookLibrary.connect(address2).returnBook(ROBINSON_CRUSOE)
                ).to.be.revertedWith(BOOK_NOT_BORROWED_ERROR);
            });
        });

        describe("Return a book", function () {
            it("Should be able to return a book that was previously borrowed by the same address", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                // Borrow the book
                const tx1: ContractTransaction = await bookLibrary.connect(address3).borrowBook(FRANKENSTEIN);
                expect(tx1.hash).to.be.a("string");

                // Get the book and check that the number of copies is decreased
                const bookBeforeReturning: BookLibrary.BookStruct =
                    await bookLibrary.getBookByTitle(FRANKENSTEIN);
                expect(bookBeforeReturning.title).to.equal(FRANKENSTEIN);
                expect(bookBeforeReturning.copies).to.equal(0);

                let borrowers = bookBeforeReturning.borrowers;
                expect(borrowers.length).to.equal(1);
                expect(await borrowers[0]).to.equal(address3.address);

                // Return the book
                const tx2: ContractTransaction = await bookLibrary.connect(address3).returnBook(FRANKENSTEIN);
                expect(tx2.hash).to.be.a("string");

                // Get the book and check that the number of copies is decreased
                const bookAfterReturning: BookLibrary.BookStruct =
                    await bookLibrary.getBookByTitle(FRANKENSTEIN);
                expect(bookAfterReturning.title).to.equal(FRANKENSTEIN);
                expect(bookAfterReturning.copies).to.equal(1);

                // Borrowers should be changed after returning a book
                borrowers = bookAfterReturning.borrowers;
                expect(borrowers.length).to.equal(1);
                expect(await borrowers[0]).to.equal(address3.address);
            });
        });

        describe("Events", function () {
            it("Emit a BookReturned event when returning a copy of a book", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                // Borrow the book
                const tx1: ContractTransaction = await bookLibrary.connect(address1).borrowBook(MOBY_DICK);
                expect(tx1.hash).to.be.a("string");

                // return the book
                await expect(
                    bookLibrary.connect(address1).returnBook(MOBY_DICK)
                )
                    .to.emit(bookLibrary, "BookReturned")
                    .withArgs(MOBY_DICK, address1.address, 2);
            });
        });
    });

    describe("Get borrowers", function () {
        describe("Validations", function () {
            it("Should throw when trying to get the borrowers of a book with an empty title", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );
                expect(bookLibrary.getBorrowers("")).to.be.revertedWith(
                    INVALID_TITLE_ERROR
                );
            });

            it("Should throw when trying to get the borrowers of a book that doesn't exist", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                expect(
                    bookLibrary.getBorrowers(BOOK_NOT_ADDED_TITLE)
                ).to.be.revertedWith(BOOK_DOES_NOT_EXIST_ERROR);
            });
        });   

        describe("Get borrowers", function() {
            it("Should return an empty array if no book was borrowed", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                const borrowers: string[] = await bookLibrary.getBorrowers(ROBINSON_CRUSOE);
                expect((await bookLibrary.getBorrowers(ROBINSON_CRUSOE)).length).to.equal(0);
            });

            it("Should return the borrowers after borrowing a book", async function () {
                const { bookLibrary } = await loadFixture(
                    deployLibraryWithBooks
                );

                // Borrow the book
                const tx: ContractTransaction = await bookLibrary.connect(address3).borrowBook(ROBINSON_CRUSOE);
                expect(tx.hash).to.be.a("string");

                const borrowers: string[] = await bookLibrary.getBorrowers(ROBINSON_CRUSOE);
                expect(borrowers.length).to.equal(1);
                expect(borrowers[0]).to.equal(address3.address);
            });
        });
    });
});
