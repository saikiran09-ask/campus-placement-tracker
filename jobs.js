const express = require('express');
const router = express.Router();
const Job = require('./Job');
const Company = require('./Company');
const Application = require('./Application');

// Middleware to check auth
function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.redirect('/dashboard');
}

// Get all jobs
router.get('/', ensureAuth, async (req, res) => {
    const jobs = await Job.findAll({ include: Company });
    res.render('jobs', { user: req.user, jobs });
});

// Admin: Add Job View
router.get('/add', isAdmin, async (req, res) => {
    const companies = await Company.findAll();
    res.render('add-job', { user: req.user, companies });
});

// Admin: Add Job Handle
router.post('/add', isAdmin, async (req, res) => {
    const { companyId, title, description, salary, minCGPA, eligibleBranches, deadline } = req.body;
    try {
        await Job.create({
            companyId, title, description, salary, minCGPA, eligibleBranches, deadline
        });
        res.redirect('/jobs');
    } catch (error) {
        console.error(error);
        res.redirect('/jobs/add');
    }
});

// Job Details
router.get('/:id', ensureAuth, async (req, res) => {
    const job = await Job.findOne({ where: { id: req.params.id }, include: Company });
    if (!job) return res.status(404).send('Job not found');

    // Check if student applied
    let applied = false;
    if (req.user.role === 'student') {
        const app = await Application.findOne({ where: { studentId: req.user.id, jobId: job.id } });
        if (app) applied = true;
    }

    res.render('job-details', { user: req.user, job, applied, error: req.query.error });
});

module.exports = router;
