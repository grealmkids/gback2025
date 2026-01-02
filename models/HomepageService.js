const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HomepageService = sequelize.define('HomepageService', {
    icon: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cardClass: {
        type: DataTypes.STRING,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = HomepageService;
