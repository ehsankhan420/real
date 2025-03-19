const assert = require('assert');
const Book = require('../models/Book');
const User = require('../models/User');

// Test function
function runTests() {
  console.log('Starting Book Lending System tests...');
  
  // Test user registration
  console.log('Testing user registration...');
  const username = 'testuser_' + Date.now();
  const regResult = User.registerUser(username, 'password123');
  assert.strictEqual(regResult.success, true, 'User registration should succeed');
  
  // Test user login
  console.log('Testing user login...');
  const loginResult = User.loginUser(username, 'password123');
  assert.strictEqual(loginResult.success, true, 'User login should succeed');
  assert.ok(loginResult.token, 'Login should return a token');
  
  // Test adding a book
  console.log('Testing adding a book...');
  const testBook = Book.addBook('Test Book', 'Test Author', 'Fiction');
  assert.strictEqual(testBook.title, 'Test Book', 'Book should be added correctly');
  assert.strictEqual(testBook.category, 'Fiction', 'Book category should be set correctly');
  
  // Test lending a book
  console.log('Testing lending a book...');
  const userId = regResult.user.id;
  const lendResult = Book.lendBook(testBook.id, 'Test Borrower', '2025-04-01', userId);
  assert.strictEqual(lendResult.success, true, 'Book lending should succeed');
  assert.strictEqual(lendResult.book.available, false, 'Book should be marked as not available');
  
  // Test getting borrowed books
  console.log('Testing getting borrowed books...');
  const borrowedBooks = Book.getBorrowedBooks();
  assert.ok(borrowedBooks.some(b => b.id === testBook.id), 'Borrowed books should include the test book');
  
  // Test filtering borrowed books by category
  console.log('Testing filtering borrowed books by category...');
  const fictionBooks = Book.getBorrowedBooks({ category: 'Fiction' });
  assert.ok(fictionBooks.some(b => b.id === testBook.id), 'Fiction books should include the test book');
  
  // Test returning a book
  console.log('Testing returning a book...');
  const returnResult = Book.returnBook(testBook.id);
  assert.strictEqual(returnResult.success, true, 'Book return should succeed');
  assert.strictEqual(returnResult.book.available, true, 'Book should be marked as available');

  console.log('All tests passed successfully!');
  return true;
}

try {
  const result = runTests();
  process.exit(result ? 0 : 1);
} catch (error) {
  console.error('Tests failed:', error);
  process.exit(1);
}