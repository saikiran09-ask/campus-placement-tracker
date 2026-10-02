const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require('./User');
const Job = require('./Job');

const Application = sequelize.define('Application', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    jobId: {
        type: DataTypes.INTEGER,
        references: {
            model: Job,
            key: 'id'
        }
    },
    appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('Applied', 'Shortlisted', 'Rejected', 'Selected'),
        defaultValue: 'Applied'
    }
});

User.hasMany(Application, { foreignKey: 'studentId' });
Application.belongsTo(User, { foreignKey: 'studentId' });

Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

module.exports = Application;
