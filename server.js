const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const sequelize = require('./db');

const app = express();

// Passport config
require('./passport')(passport);

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global vars for views (if needed)
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/auth', require('./auth'));
app.use('/companies', require('./companies'));
app.use('/jobs', require('./jobs'));
app.use('/applications', require('./applications'));
app.use('/interviews', require('./interviews'));
app.use('/reports', require('./reports'));

// Index Route
app.get('/', (req, res) => {
    res.render('index');
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login');
    }

    if (req.user.role === 'admin') {
        res.redirect('/reports'); // Admin dashboard can be reports
    } else {
        // Basic student dashboard info
        res.render('dashboard', { user: req.user });
    }
});

// Start DB and Server
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
