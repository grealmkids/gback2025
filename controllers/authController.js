const bcrypt = require("bcrypt");
const User = require("../models/user");
const { sendSMS } = require("../utils/smsService");
const nodemailer = require("nodemailer");
const emailService = require("../utils/emailService");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "grealmkids@gmail.com",
    pass: "your-email-password", // Replace with your Gmail app password
  },
});

// Send verification code to client
exports.sendClientOTP = async (req, res) => {
  const { phoneOrEmail } = req.body;
  if (!phoneOrEmail) {
    return res.status(400).json({ message: "Phone or email is required." });
  }
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Find the user by email or phone
    const isEmail = phoneOrEmail.includes("@");
    const user = await User.findOne({
      where: isEmail ? { email: phoneOrEmail } : { phone: phoneOrEmail },
    });

    if (!user) {
      return res.status(404).json({
        message:
          "User not found. Please ensure the phone number or email is registered in the system.",
      });
    }

    // Save the OTP in the user's verification_code column
    user.verification_code = otp;
    await user.save();

    console.log(`Generated OTP: ${otp}`);

    // Send OTP via email or SMS
    if (isEmail) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Your G-REALM Login Code</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Here is your verification code:</p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #28a745;">${otp}</span>
            </div>
          </div>
        </div>
      `;
      await emailService.sendHTMLEmail(
        phoneOrEmail,
        "Your Verification Code",
        htmlContent
      );
    } else {
      const message = `Your verification code is: ${otp}`;
      username = "alfredochola"; // Replace with your SMS username
      password = "JesusisLORD"; // Replace with your SMS password
      await sendSMS(username, password, "sender", phoneOrEmail, message);
    }

    res.json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error in sendClientOTP:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify verification code and login
exports.verifyOTP = async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ message: "OTP is required." });
  }

  try {
    // Simulate OTP verification logic
    const user = await User.findOne({ where: { verification_code: otp } });

    if (!user) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    // Remove the verification code after successful verification
    user.verification_code = null;
    await user.save();

    // Remove sensitive information like password
    const { password, ...userDetails } = user.toJSON();

    res.json({
      message: "OTP verified successfully.",
      user: userDetails,
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
