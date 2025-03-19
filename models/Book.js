const fs = require('fs');
const path = require('path');

// Path for storing book data
const dataPath = path.join(__dirname, '../data');
const booksFile = path.join(dataPath, 'books.json');

// Ensure data directory exists
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Initialize books.json if it doesn't exist
if (!fs.existsSync(booksFile)) {
  fs.writeFileSync(booksFile, JSON.stringify([]));
}

class Book {
  constructor() {
    this.books = this.loadBooks();
  }

  loadBooks() {
    try {
      return JSON.parse(fs.readFileSync(booksFile));
    } catch (error) {
      return [];
    }
  }

  saveBooks() {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    fs.writeFileSync(booksFile, JSON.stringify(this.books, null, 2));
  }

  getAllBooks() {
    return this.books;
  }

  getBookById(id) {
    return this.books.find(book => book.id === id);
  }

  addBook(title, author, category) {
    const newId = this.books.length > 0 ? Math.max(...this.books.map(b => b.id)) + 1 : 1;
    
    const newBook = {
      id: newId,
      title,
      author,
      category,
      available: true
    };

    this.books.push(newBook);
    this.saveBooks();
    return newBook;
  }

  lendBook(bookId, borrowerName, dueDate, userId) {
    const book = this.getBookById(bookId);
    
    if (!book) {
      return { success: false, message: 'Book not found' };
    }
    
    if (!book.available) {
      return { success: false, message: 'Book is already borrowed' };
    }

    book.available = false;
    book.borrower = borrowerName;
    book.dueDate = dueDate;
    book.lentBy = userId;
    this.saveBooks();

    return { success: true, book };
  }

  returnBook(bookId) {
    const book = this.getBookById(bookId);
    
    if (!book) {
      return { success: false, message: 'Book not found' };
    }
    
    if (book.available) {
      return { success: false, message: 'Book is not currently borrowed' };
    }

    book.available = true;
    delete book.borrower;
    delete book.dueDate;
    delete book.lentBy;
    this.saveBooks();

    return { success: true, book };
  }

  getBorrowedBooks(filters = {}) {
    let borrowedBooks = this.books.filter(book => !book.available);
    
    // Apply filters
    if (filters.category) {
      borrowedBooks = borrowedBooks.filter(book => book.category === filters.category);
    }
    
    if (filters.borrower) {
      borrowedBooks = borrowedBooks.filter(book => book.borrower === filters.borrower);
    }
    
    if (filters.dueDate) {
      borrowedBooks = borrowedBooks.filter(book => {
        const bookDueDate = new Date(book.dueDate).setHours(0, 0, 0, 0);
        const filterDate = new Date(filters.dueDate).setHours(0, 0, 0, 0);
        return bookDueDate === filterDate;
      });
    }
    
    if (filters.dueBefore) {
      borrowedBooks = borrowedBooks.filter(book => {
        return new Date(book.dueDate) <= new Date(filters.dueBefore);
      });
    }
    
    if (filters.userId) {
      borrowedBooks = borrowedBooks.filter(book => book.lentBy === filters.userId);
    }
    
    return borrowedBooks;
  }

  getBooksByCategory(category) {
    return this.books.filter(book => book.category === category);
  }
}

module.exports = new Book();