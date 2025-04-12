const express = require("express");
const router = express.Router();

// Placeholder for API routes
router.use("/auth", require("./auth"));
router.use("/admin", require("./admin"));
router.use("/client", require("./client"));

module.exports = router;
