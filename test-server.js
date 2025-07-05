// Simple test to see if Passenger is working
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Backend is working!", timestamp: new Date() });
});

app.get("/test", (req, res) => {
  res.json({ status: "OK", message: "Test endpoint working" });
});

app.listen(PORT, () => {
  console.log(`Backend test server running on port ${PORT}`);
});

module.exports = app;
