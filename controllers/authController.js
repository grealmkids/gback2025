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

// Admin login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, role: "admin" } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ message: "Admin login successful" });
  } catch (error) {
    console.error("Error in loginAdmin:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Client login
exports.loginClient = async (req, res) => {
  const { phoneOrEmail, password } = req.body;
  try {
    const user = await User.findOne({
      where: phoneOrEmail.includes("@")
        ? { email: phoneOrEmail, role: "client" }
        : { phone: phoneOrEmail, role: "client" },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ message: "Client login successful" });
  } catch (error) {
    console.error("Error in loginClient:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Send verification code to client
exports.sendClientOTP = async (req, res) => {
  const { phoneOrEmail } = req.body;
  if (!phoneOrEmail) {
    return res.status(400).json({ message: "Phone or email is required." });
  }
  try {
    const isEmail = phoneOrEmail.includes("@");
    const user = await User.findOne({
      where: isEmail
        ? { email: phoneOrEmail, role: "client" }
        : { phone: phoneOrEmail, role: "client" },
    });

    if (!user) {
      return res.status(404).json({
        message:
          "Client not found. Please ensure the phone number or email is registered in the system.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verification_code = otp;
    await user.save();

    console.log(`Generated verification code for ${phoneOrEmail}: ${otp}`); // Log the verification code for debugging

    if (isEmail) {
      // Send verification code via email using EmailService
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">G-REALM Verification Code</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">
              Your verification code is:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #28a745;">${otp}</span>
            </div>
            <p style="font-size: 16px; color: #333;">
              Please use this verification code to verify your account. If you did not request this, please ignore this email.
            </p>
            <p style="font-size: 16px; color: #333;">Thank you,</p>
            <p style="font-size: 16px; color: #333;">The G-REALM Team</p>
          </div>
        </div>
      `;

      await emailService.sendHTMLEmail(
        phoneOrEmail,
        "Your G-REALM Verification Code",
        htmlContent
      );
      res.json({ message: "Verification code sent successfully via email" });
    } else {
      // Send verification code via SMS
      const message = `Your grealm.org verification code is ${otp}`; // Updated message to include grealm.org
      const smsResponse = await sendSMS(
        "alfredochola",
        "JesusisLORD",
        "Egosms",
        phoneOrEmail,
        message
      );
      console.log(`SMS Response: ${smsResponse}`); // Log the SMS response for debugging
      res.json({
        message: "Verification code sent successfully via SMS",
        smsResponse,
      });
    }
  } catch (error) {
    console.error("Error in sendClientOTP:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify verification code and login
exports.verifyOTP = async (req, res) => {
  const { phoneOrEmail, otp } = req.body;
  if (!phoneOrEmail || !otp) {
    return res
      .status(400)
      .json({ message: "Phone or email and verification code are required." });
  }

  try {
    const isEmail = phoneOrEmail.includes("@");
    const user = await User.findOne({
      where: isEmail
        ? { email: phoneOrEmail, role: "client" }
        : { phone: phoneOrEmail, role: "client" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.verification_code !== otp) {
      return res.status(401).json({ message: "Invalid verification code." });
    }

    // Update account status to verified after successful verification code verification
    user.accountStatus = "verified";
    user.verification_code = null;
    await user.save();

    res.json({
      message: "Verification code verified successfully. Login successful.",
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
