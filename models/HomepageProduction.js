const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HomepageProduction = sequelize.define('HomepageProduction', {
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statusClass: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subtitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    details: {
        type: DataTypes.STRING,
        allowNull: true
    },
    barColor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = HomepageProduction;
