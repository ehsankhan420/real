const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Register a new user
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const result = User.registerUser(username, password);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
});

// Login user
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const result = User.loginUser(username, password);
  
  if (!result.success) {
    return res.status(401).json(result);
  }

  res.status(200).json(result);
});

module.exports = router;