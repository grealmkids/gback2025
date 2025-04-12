const request = require("supertest");
const app = require("../index");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const db = require("../config/database");

beforeAll(async () => {
  // Sync database to ensure tables exist
  await db.sync();

  // Disable foreign key checks and truncate the user table
  await db.query("SET FOREIGN_KEY_CHECKS = 0;");
  await User.destroy({ where: {}, truncate: true });
  await db.query("SET FOREIGN_KEY_CHECKS = 1;");

  // Create admin user
  const adminPassword = await bcrypt.hash("password", 10);
  await User.create({
    email: "admin@example.com",
    password: adminPassword,
    role: "admin",
    phone: null, // Ensure phone is not set for admin
  });

  // Create client user
  const clientPassword = await bcrypt.hash("password", 10);
  await User.create({
    email: "client@example.com",
    password: clientPassword,
    role: "client",
    phone: "256773913902", // Updated phone number
  });
});

describe("Auth API Tests", () => {
  it("should login admin", async () => {
    const response = await request(app)
      .post("/api/auth/admin/login")
      .send({ email: "admin@example.com", password: "password" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Admin login successful");
  });

  it("should login client", async () => {
    const response = await request(app)
      .post("/api/auth/client/login")
      .send({ phoneOrEmail: "client@example.com", password: "password" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Client login successful");
  });

  it("should login client using phone", async () => {
    const response = await request(app)
      .post("/api/auth/client/login")
      .send({ phoneOrEmail: "256773913902", password: "password" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Client login successful");
  });

  it("should send OTP to client", async () => {
    const response = await request(app)
      .post("/api/auth/client/send-otp")
      .send({ phoneOrEmail: "256773913902" }); // Updated field name
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "OTP sent successfully via SMS"
    );
  });
});
