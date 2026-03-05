const nodemailer = require("nodemailer");

// Simple in-memory store for OTPs
// In a production system setting you'd use Redis or DB with an expiration timestamp
const otpStore = new Map();

// Configure the transporter using the credentials provided
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "grealm.org",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Generate a 6-digit OTP and send and store it
 */
const generateAndSendOtp = async (email) => {
    // Generate a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store it alongside an expiration time (10 minutes)
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt });

    const mailOptions = {
        from: '"G-Realm Admin" <admin@grealm.org>',
        to: email,
        subject: "Action Required: Dynamic Category Creation OTP",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Security Verification</h2>
                <p>You have requested to create a new Dynamic Database Category Table.</p>
                <p>Please use the following One-Time Password to authorize this action. This code will expire in 10 minutes.</p>
                <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>If you did not request this action, please secure your admin account immediately.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    return true;
};

/**
 * Validate an OTP
 */
const validateOtp = (email, providedOtp) => {
    const record = otpStore.get(email);
    if (!record) return false;

    // Check expiration
    if (Date.now() > record.expiresAt) {
        otpStore.delete(email); // Clean up expired
        return false;
    }

    if (record.otp === providedOtp) {
        otpStore.delete(email); // Consume the OTP instantly so it can't be reused
        return true;
    }

    return false;
};

module.exports = {
    generateAndSendOtp,
    validateOtp
};
