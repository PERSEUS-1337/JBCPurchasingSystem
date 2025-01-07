import request, { Response } from "supertest";
import app from "../src/app";
import { describe, it, expect } from "@jest/globals";

describe("Backend Health Check Endpoint", () => {
    it("should return 200 and a success message", async () => {
        const response: Response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Server is running!");
    });
});

