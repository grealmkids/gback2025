const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  loginClient,
  sendClientOTP,
  verifyOTP,
} = require("../controllers/authController");

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate an admin user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

// Admin login
router.post("/admin/login", loginAdmin);

/**
 * @swagger
 * /auth/client/login:
 *   post:
 *     summary: Client login
 *     description: Authenticate a client user with phone or email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneOrEmail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

// Client login
router.post("/client/login", loginClient);

/**
 * @swagger
 * /auth/client/send-otp:
 *   post:
 *     summary: Send OTP to client
 *     description: Send a one-time password (OTP) to a client's phone or email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneOrEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: Client not found
 */

// Send OTP to client
router.post("/client/send-otp", sendClientOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verify a one-time password (OTP) and log in the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneOrEmail:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       401:
 *         description: Invalid OTP
 */

// Verify OTP and login
router.post("/verify-otp", verifyOTP);

module.exports = router;
