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
});
