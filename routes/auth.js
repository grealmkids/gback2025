const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  loginClient,
  sendClientOTP,
  verifyOTP,
} = require("../controllers/authController");

// Admin login
router.post("/admin/login", loginAdmin);

// Client login
router.post("/client/login", loginClient);

// Send OTP to client
router.post("/client/send-otp", sendClientOTP);

// Verify OTP and login
router.post("/verify-otp", verifyOTP);

module.exports = router;
