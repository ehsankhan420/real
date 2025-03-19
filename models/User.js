const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Path for storing user data
const dataPath = path.join(__dirname, '../data');
const usersFile = path.join(dataPath, 'users.json');

// Secret key for JWT
const JWT_SECRET = 'book-lending-system-secret';

// Ensure data directory exists
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Initialize users.json if it doesn't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}

class User {
  constructor() {
    this.users = this.loadUsers();
  }

  loadUsers() {
    try {
      return JSON.parse(fs.readFileSync(usersFile));
    } catch (error) {
      return [];
    }
  }

  saveUsers() {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    fs.writeFileSync(usersFile, JSON.stringify(this.users, null, 2));
  }

  getAllUsers() {
    // Return users without passwords
    return this.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  getUserById(id) {
    const user = this.users.find(user => user.id === id);
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  registerUser(username, password) {
    // Check if username already exists
    if (this.users.find(user => user.username === username)) {
      return { success: false, message: 'Username already exists' };
    }

    const newId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      id: newId,
      username,
      password: hashedPassword
    };

    this.users.push(newUser);
    this.saveUsers();

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  }

  loginUser(username, password) {
    // Find user by username
    const user = this.users.find(user => user.username === username);
    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { success: true, token };
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { success: true, userId: decoded.id };
    } catch (error) {
      return { success: false, message: 'Invalid token' };
    }
  }
}

module.exports = new User();