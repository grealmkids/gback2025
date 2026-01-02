require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow only specific origins
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];
const allowedOrigins = [
  "https://grealm.org",
  "http://localhost:4200",
  "http://localhost:59253",
  ...corsOrigins,
];

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== "production";

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow all localhost origins
      if (isDevelopment && origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      // Check against allowed origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS blocked origin: ${origin}`);
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

// Mount homepage routes
app.use("/api/homepage", require("./routes/homepage"));

// Placeholder for routes
app.use("/api", require("./routes"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Grealm Backend API is running" });
});

// API info endpoint (moved from root)
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Grealm Backend API",
    endpoints: {
      auth: "/api/auth",
      client: "/api/client",
      health: "/health",
    },
  });
});

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
