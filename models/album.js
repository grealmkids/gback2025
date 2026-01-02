const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Album = sequelize.define(
  "Album",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    songs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    video: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    audio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coloringPics: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coloredPics: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ugx: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usd: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    contents: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    downloadUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    previewvideo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "URL or path to preview video for the album cover",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "completed",
      comment: "Project status: 'completed', 'in_progress', 'future'",
    },
    youtubeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    s3Url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "album",
  }
);

module.exports = Album;
