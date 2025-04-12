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

// Send OTP to client
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

    console.log(`Generated OTP for ${phoneOrEmail}: ${otp}`); // Log the OTP for debugging

    if (isEmail) {
      // Send OTP via email using EmailService
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">G-REALM OTP</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">
              Your one-time password (OTP) is:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #28a745;">${otp}</span>
            </div>
            <p style="font-size: 16px; color: #333;">
              Please use this OTP to verify your account. If you did not request this, please ignore this email.
            </p>
            <p style="font-size: 16px; color: #333;">Thank you,</p>
            <p style="font-size: 16px; color: #333;">The G-REALM Team</p>
          </div>
        </div>
      `;

      await emailService.sendHTMLEmail(
        phoneOrEmail,
        "Your G-REALM OTP",
        htmlContent
      );
      res.json({ message: "OTP sent successfully via email" });
    } else {
      // Send OTP via SMS
      const message = `Your grealm.org verification number is ${otp}`; // Updated message to include grealm.org
      const smsResponse = await sendSMS(
        "alfredochola",
        "JesusisLORD",
        "Egosms",
        phoneOrEmail,
        message
      );
      console.log(`SMS Response: ${smsResponse}`); // Log the SMS response for debugging
      res.json({ message: "OTP sent successfully via SMS", smsResponse });
    }
  } catch (error) {
    console.error("Error in sendClientOTP:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Verify OTP and login
exports.verifyOTP = async (req, res) => {
  const { phoneOrEmail, otp } = req.body;
  if (!phoneOrEmail || !otp) {
    return res
      .status(400)
      .json({ message: "Phone or email and OTP are required." });
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
      return res.status(401).json({ message: "Invalid OTP." });
    }

    // Update account status to verified after successful OTP verification
    user.accountStatus = "verified";
    user.verification_code = null;
    await user.save();

    res.json({ message: "OTP verified successfully. Login successful." });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
