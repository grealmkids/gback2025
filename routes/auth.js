const express = require("express");
const router = express.Router();
const { sendClientOTP, verifyOTP } = require("../controllers/authController");

// Send OTP to user (email or phone)
router.post("/send-otp", sendClientOTP);

// Verify OTP only
router.post("/verify-otp", verifyOTP);

module.exports = router;
