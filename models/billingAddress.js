const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const BillingAddress = sequelize.define(
  "BillingAddress",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email_address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "KE",
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    line_1: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    line_2: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zip_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "billing_addresses",
  }
);

// Define associations
BillingAddress.belongsTo(User, { foreignKey: "userId" });
User.hasOne(BillingAddress, { foreignKey: "userId" });

module.exports = BillingAddress;
