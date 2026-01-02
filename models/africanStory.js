const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AfricanStory = sequelize.define("AfricanStory", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // The 5 components mentioned by user
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    storyBookUrl: { // PDF
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Colored Story Book PDF"
    },
    coloringBookUrl: { // PDF
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Coloring Book Version PDF"
    },
    flashcardsUrl: { // PDF
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Flashcards PDF"
    },
    audioUrl: { // Optional, implicitly user said 5 products but listed 4 distinct file types + video. Maybe 'colored story book' is distinct from 'story book'? 
        // User said: "video,colored story book pdf version of the same story, coloring book version pdf, flashcards of the characters pdf"
        // That is 4. I will add audioUrl just in case or stick to these.
        type: DataTypes.STRING,
        allowNull: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: "african_stories",
    timestamps: true,
});

module.exports = AfricanStory;
