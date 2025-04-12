const request = require("supertest");
const app = require("../index");

beforeAll(async () => {
  // Create the required album for the test
  await request(app).post("/api/admin/add-album").send({
    title: "Sample Album",
    description: "A sample album for testing",
    downloadLink: "http://example.com/sample-album",
  });
});

// Temporarily disable cleanup by commenting out the afterAll hook
/*
afterAll(async () => {
  // Clean up the database after tests
  const db = require("../config/database");
  await db.query("DELETE FROM `album` WHERE `title` = 'Sample Album';");
  await db.query("DELETE FROM `user` WHERE `email` LIKE 'john%@example.com';");
});
*/

describe("Admin API Tests", () => {
  it("should add a new client", async () => {
    const uniqueEmail = `john${Date.now()}@example.com`;
    const response = await request(app).post("/api/admin/add-client").send({
      email: uniqueEmail,
      phone: "1234567890",
      purchasedAlbumTitle: "Sample Album",
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Client added successfully"
    );
  });

  it("should add a new album", async () => {
    const response = await request(app).post("/api/admin/add-album").send({
      title: "New Album",
      description: "A sample album description",
      downloadLink: "http://example.com/download",
    });
    expect([200, 201]).toContain(response.status);
    if (response.status === 201) {
      expect(response.body).toHaveProperty(
        "message",
        "Album added successfully"
      );
    } else {
      expect(response.body).toHaveProperty(
        "message",
        "Album updated successfully"
      );
    }
  });
});
