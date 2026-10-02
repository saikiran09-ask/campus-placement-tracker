const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('./User');

// Register View
router.get('/register', (req, res) => {
    res.render('register');
});

// Login View
router.get('/login', (req, res) => {
    res.render('login');
});

// Register Handle
router.post('/register', async (req, res) => {
    const { name, email, password, role, branch, cgpa, graduationYear } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.render('register', { error: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            branch,
            cgpa: cgpa ? parseFloat(cgpa) : null,
            graduationYear: graduationYear ? parseInt(graduationYear) : null
        });

        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Server error during registration' });
    }
});

// Login Handle
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: false // you can enable connect-flash if you like, but we'll try to keep it simple
}));

// Logout Handle
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/auth/login');
    });
});

module.exports = router;
