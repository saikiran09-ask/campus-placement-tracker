const express = require('express');
const router = express.Router();
const User = require('./User');
const Company = require('./Company');
const Job = require('./Job');
const Application = require('./Application');

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.redirect('/dashboard');
}

router.get('/', isAdmin, async (req, res) => {
    try {
        const totalStudents = await User.count({ where: { role: 'student' } });
        const totalCompanies = await Company.count();
        const totalJobs = await Job.count();
        const totalApplications = await Application.count();
        const placedStudents = await Application.count({ where: { status: 'Selected' } });

        // Very basic highest/avg package calculation
        // Assuming salary is string like "8 LPA". Very naive calculation.
        let highestPackage = 0;

        const selectedApps = await Application.findAll({
            where: { status: 'Selected' },
            include: [Job]
        });

        let totalLPA = 0;
        let validSalariesCount = 0;

        selectedApps.forEach(app => {
            if (app.Job && app.Job.salary) {
                const salaryMatch = app.Job.salary.match(/(\d+(\.\d+)?)/);
                if (salaryMatch) {
                    const lpa = parseFloat(salaryMatch[1]);
                    if (lpa > highestPackage) highestPackage = lpa;
                    totalLPA += lpa;
                    validSalariesCount++;
                }
            }
        });

        const averagePackage = validSalariesCount > 0 ? (totalLPA / validSalariesCount).toFixed(2) : 0;
        const placementPercentage = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

        res.render('reports', {
            user: req.user,
            totalStudents,
            totalCompanies,
            totalJobs,
            totalApplications,
            placedStudents,
            highestPackage,
            averagePackage,
            placementPercentage
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
