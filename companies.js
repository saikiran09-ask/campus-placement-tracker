const express = require('express');
const router = express.Router();
const Company = require('./Company');

// Middleware to check admin role
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/dashboard');
}

// Get all companies
router.get('/', async (req, res) => {
    const companies = await Company.findAll();
    res.render('companies', { user: req.user, companies });
});

// Admin: Add Company View
router.get('/add', isAdmin, (req, res) => {
    res.render('add-company', { user: req.user });
});

// Admin: Add Company Handle
router.post('/add', isAdmin, async (req, res) => {
    const { name, description, location, website } = req.body;
    try {
        await Company.create({ name, description, location, website });
        res.redirect('/companies');
    } catch (error) {
        console.error(error);
        res.redirect('/companies/add');
    }
});

module.exports = router;
