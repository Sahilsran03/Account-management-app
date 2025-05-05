const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Show register form
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration
router.post('/register', async (req, res) => {
  try {
    const user = new User({ username: req.body.username });
    await User.register(user, req.body.password);
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: err.message });
  }
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login', { error: req.query.error });
});

// Handle login
router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login?error=Invalid username or password',
    successRedirect: '/dashboard',
  })
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

module.exports = router;