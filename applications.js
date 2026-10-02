const express = require('express');
const router = express.Router();
const Application = require('./Application');
const Job = require('./Job');
const User = require('./User');
const Company = require('./Company');
const Interview = require('./Interview');

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
}

// Student: Apply for a Job
router.post('/apply/:jobId', ensureAuth, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).send('Only students can apply');

    const jobId = req.params.jobId;
    const student = req.user;

    try {
        const job = await Job.findByPk(jobId);
        if (!job) return res.status(404).send('Job not found');

        // 1. Check if already applied
        const existing = await Application.findOne({ where: { studentId: student.id, jobId: job.id } });
        if (existing) {
            return res.redirect(`/jobs/${job.id}?error=You have already applied for this job`);
        }

        // 2. Check CGPA
        if (student.cgpa < job.minCGPA) {
            return res.redirect(`/jobs/${job.id}?error=You are not eligible. Minimum CGPA required is ${job.minCGPA}`);
        }

        // 3. Check Branch
        let branchEligible = true;
        if (job.eligibleBranches && student.branch) {
            const allowed = job.eligibleBranches.split(',').map(b => b.trim().toLowerCase());
            if (!allowed.includes(student.branch.toLowerCase())) {
                branchEligible = false;
            }
        }
        if (!branchEligible) {
            return res.redirect(`/jobs/${job.id}?error=You are not eligible. Branch ${student.branch} is not eligible.`);
        }

        // 4. Check Deadline
        if (job.deadline && new Date() > new Date(job.deadline)) {
            return res.redirect(`/jobs/${job.id}?error=The deadline for this job has passed.`);
        }

        // All checks passed!
        await Application.create({
            studentId: student.id,
            jobId: job.id,
            status: 'Applied'
        });

        res.redirect('/applications/my-applications');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Student: My Applications
router.get('/my-applications', ensureAuth, async (req, res) => {
    if (req.user.role !== 'student') return res.redirect('/dashboard');

    const applications = await Application.findAll({
        where: { studentId: req.user.id },
        include: [{ model: Job, include: [Company] }]
    });

    res.render('my-applications', { user: req.user, applications });
});

// Admin: View All Applications or By Job
router.get('/', ensureAuth, async (req, res) => {
    if (req.user.role !== 'admin') return res.redirect('/dashboard');

    const applications = await Application.findAll({
        include: [User, { model: Job, include: [Company] }]
    });

    res.render('applications', { user: req.user, applications });
});

// Admin: Update Status
router.post('/:id/status', ensureAuth, async (req, res) => {
    if (req.user.role !== 'admin') return res.redirect('/dashboard');

    try {
        const app = await Application.findByPk(req.params.id);
        if (app) {
            app.status = req.body.status;
            await app.save();
        }
        res.redirect('/applications');
    } catch (error) {
        console.error(error);
        res.send('Error');
    }
});

// Application details & Interview Tracking
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        const application = await Application.findOne({
            where: { id: req.params.id },
            include: [
                User,
                { model: Job, include: [Company] },
                Interview
            ]
        });

        if (!application) return res.status(404).send('Application not found');

        if (req.user.role === 'student' && application.studentId !== req.user.id) {
            return res.status(403).send('Unauthorized');
        }

        res.render('application-details', { user: req.user, application });
    } catch (error) {
        res.status(500).send('Error');
    }
});

module.exports = router;
