const request = require("supertest");
const app = require("../index");
const User = require("../models/user");
const Album = require("../models/album");
const bcrypt = require("bcrypt");

beforeAll(async () => {
  // Sync database to ensure tables exist
  const db = require("../config/database");
  await db.sync({ force: true }); // This will create tables including billing_address

  // Create test user
  const clientPassword = await bcrypt.hash("password", 10);
  await User.create({
    email: "ochalfie@gmail.com",
    password: clientPassword,
    role: "client",
    phone: "256773913902",
  });

  // Create test album
  await Album.create({
    title: "Domestic Animals",
    image: "/assets/domesticanimals.jpg",
    songs: 4,
    video: 4,
    audio: 4,
    coloringPics: 15,
    coloredPics: 15,
    ugx: "10,000",
    usd: 4,
    contents: [
      "Domestic Animal Names",
      "Domestic Animal Sounds",
      "Domestic Animal Homes",
      "Domestic Animal Young Ones",
      "11 Domestic Animals",
    ],
    downloadUrl: "http://example.com/domestic-animals",
  });
});

describe("Client API Tests", () => {
  it("should fetch purchased albums", async () => {
    const response = await request(app).get(
      "/api/client/purchased-albums?clientId=1"
    );
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it("should insert a new client_album row", async () => {
    const response = await request(app)
      .post("/api/client/insert-client-album")
      .send({
        userId: 1, // Assuming user with ID 1 exists
        albumId: 1, // Assuming album with ID 1 exists
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Client album row inserted successfully."
    );
  });

  it("should fetch details of a specific album by ID", async () => {
    const albumId = 1; // Replace with a valid album ID in your database
    const response = await request(app).get(`/api/client/albums/${albumId}`);

    console.log("Album Details Response:", response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", albumId);
  });

  it("should save billing address for a user", async () => {
    const userEmail = "ochalfie@gmail.com"; // Using existing test user
    const billingData = {
      branch: "Test Store - Main Branch",
      email_address: "ochalfie@gmail.com",
      phone_number: "256773913902",
      country_code: "UG",
      first_name: "John",
      middle_name: "Test",
      last_name: "Doe",
      line_1: "123 Test Street, Building A",
      line_2: "Suite 456",
      city: "Kampala",
      state: "Central Region",
      postal_code: "12345",
      zip_code: "54321",
    };

    const response = await request(app)
      .post(`/api/client/billing-address/${userEmail}`)
      .send(billingData);

    console.log("Save Billing Address Response:", response.body);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Billing address saved successfully"
    );
    expect(response.body.billingAddress).toHaveProperty(
      "branch",
      billingData.branch
    );
  });

  it("should get billing address for a user", async () => {
    const userEmail = "ochalfie@gmail.com"; // Using existing test user

    const response = await request(app).get(
      `/api/client/billing-address/${userEmail}`
    );

    console.log("Get Billing Address Response:", response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("branch");
    expect(response.body).toHaveProperty("email_address");
  });
});
