const express = require('express');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();


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