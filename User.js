const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('student', 'admin'),
        defaultValue: 'student'
    },
    branch: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cgpa: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    graduationYear: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    skills: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resume: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = User;
