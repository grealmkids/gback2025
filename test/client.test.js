const request = require("supertest");
const app = require("../index");

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
});
