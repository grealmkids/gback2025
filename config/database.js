const { Sequelize } = require("sequelize");

console.log("Database Configuration:");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_DIALECT:", process.env.DB_DIALECT);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: console.log, // Enable SQL query logging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connection established successfully.");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to database:", err);
  });

module.exports = sequelize;
