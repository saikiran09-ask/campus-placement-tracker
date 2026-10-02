const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Application = require('./Application');

const Interview = sequelize.define('Interview', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    applicationId: {
        type: DataTypes.INTEGER,
        references: {
            model: Application,
            key: 'id'
        }
    },
    round: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    result: {
        type: DataTypes.STRING,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

Application.hasMany(Interview, { foreignKey: 'applicationId' });
Interview.belongsTo(Application, { foreignKey: 'applicationId' });

module.exports = Interview;
