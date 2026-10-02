const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Company = require('./Company');

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    companyId: {
        type: DataTypes.INTEGER,
        references: {
            model: Company,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    salary: {
        type: DataTypes.STRING,
        allowNull: true
    },
    minCGPA: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    eligibleBranches: {
        type: DataTypes.STRING, // e.g. "CSE, IT, AI&DS"
        allowNull: true
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Active'
    }
});

Company.hasMany(Job, { foreignKey: 'companyId' });
Job.belongsTo(Company, { foreignKey: 'companyId' });

module.exports = Job;
