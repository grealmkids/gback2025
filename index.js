require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow only specific origins
const allowedOrigins = [
  "https://grealm.org",
  "http://localhost:4200",
  "http://localhost:59253",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/client");

// Logging middleware to track incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Mount auth routes
app.use("/api/auth", authRoutes);

// Mount client routes
app.use("/api/client", clientRoutes);

// Placeholder for routes
app.use("/api", require("./routes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
