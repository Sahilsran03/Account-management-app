const express = require('express');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// Register Page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// Register Logic
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.register(new User({ username }), password);
        passport.authenticate('local')(req, res, () => {
            res.redirect('/');
        });
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Username already exists or registration error.' });
    }
});

// Login Page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Login Logic
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureMessage: true
}), (req, res) => {
    res.redirect('/');
});

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
});

module.exports = router;