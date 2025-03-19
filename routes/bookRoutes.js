const express = require('express');
const Book = require('../models/Book');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all books
router.get('/', (req, res) => {
  const books = Book.getAllBooks();
  res.status(200).json({ success: true, books });
});

// Get a specific book by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = Book.getBookById(id);
  
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }
  
  res.status(200).json({ success: true, book });
});

// Add a new book (requires authentication)
router.post('/', authMiddleware, (req, res) => {
  const { title, author, category } = req.body;
  
  if (!title || !author || !category) {
    return res.status(400).json({ success: false, message: 'Title, author, and category are required' });
  }
  
  const newBook = Book.addBook(title, author, category);
  res.status(201).json({ success: true, book: newBook });
});

// Lend a book (requires authentication)
router.post('/:id/lend', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const { borrowerName, dueDate } = req.body;
  
  if (!borrowerName || !dueDate) {
    return res.status(400).json({ success: false, message: 'Borrower name and due date are required' });
  }
  
  const result = Book.lendBook(id, borrowerName, dueDate, req.userId);
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.status(200).json(result);
});

// Return a book (requires authentication)
router.post('/:id/return', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const result = Book.returnBook(id);
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.status(200).json(result);
});

// Get borrowed books with optional filters
router.get('/borrowed/list', authMiddleware, (req, res) => {
  const { category, borrower, dueDate, dueBefore } = req.query;
  const filters = { userId: req.userId };
  
  if (category) filters.category = category;
  if (borrower) filters.borrower = borrower;
  if (dueDate) filters.dueDate = dueDate;
  if (dueBefore) filters.dueBefore = dueBefore;
  
  const borrowedBooks = Book.getBorrowedBooks(filters);
  res.status(200).json({ success: true, books: borrowedBooks });
});

// Get books by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const books = Book.getBooksByCategory(category);
  res.status(200).json({ success: true, books });
});

module.exports = router;