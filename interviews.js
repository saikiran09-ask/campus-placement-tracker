const express = require('express');
const router = express.Router();
const Interview = require('./Interview');
const Application = require('./Application');

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.redirect('/dashboard');
}

// Admin Add Interview Round
router.post('/add', isAdmin, async (req, res) => {
    const { applicationId, round, date } = req.body;
    try {
        await Interview.create({
            applicationId,
            round,
            date: date ? new Date(date) : null,
            result: 'Pending'
        });
        res.redirect(`/applications/${applicationId}`);
    } catch (error) {
        console.error(error);
        res.redirect('back');
    }
});

// Admin Update Interview Result
router.post('/:id/update', isAdmin, async (req, res) => {
    const { result, remarks } = req.body;
    try {
        const interview = await Interview.findByPk(req.params.id);
        if (interview) {
            interview.result = result;
            interview.remarks = remarks;
            await interview.save();
            res.redirect(`/applications/${interview.applicationId}`);
        } else {
            res.status(404).send('Interview not found');
        }
    } catch (error) {
        console.error(error);
        res.redirect('back');
    }
});

module.exports = router;
