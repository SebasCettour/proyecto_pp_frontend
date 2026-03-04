import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../server.js";

describe("GET /health", () => {
  it("responde 200 y ok=true", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
