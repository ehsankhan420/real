const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Initialize with sample data if running directly
if (require.main === module) {
  const Book = require('./models/Book');
  const User = require('./models/User');
  
  // Add sample users if none exist
  if (User.getAllUsers().length === 0) {
    User.registerUser('admin', 'password123');
    User.registerUser('user1', 'password123');
    console.log('Sample users created');
  }
  
  // Add sample books if none exist
  if (Book.getAllBooks().length === 0) {
    Book.addBook('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction');
    Book.addBook('To Kill a Mockingbird', 'Harper Lee', 'Fiction');
    Book.addBook('A Brief History of Time', 'Stephen Hawking', 'Science');
    Book.addBook('The World War 2', 'John Keegan', 'History');
    console.log('Sample books created');
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing