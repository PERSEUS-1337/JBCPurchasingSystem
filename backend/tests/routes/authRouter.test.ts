import request, { Response } from "supertest";
import app from "../../src/app";
import { describe, it, expect } from "@jest/globals";

describe("Authentication Routes", () => {
    describe("POST /api/auth/register", () => {
        it("should register a user successfully", async () => {
            const response: Response = await request(app)
            .post("/api/auth/register")
            .send({ username: "testuser", password: "password123" });
            
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("User registered successfully");
        });
    });

    describe("POST /api/auth/login", () => {
        it("should login a user successfully", async () => {
            const response: Response = await request(app)
            .post("/api/auth/login")
            .send({ username: "testuser", password: "password123" });
            
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Login successful");
            expect(response.body.token).toBe("mock-jwt-token");
        });
    });

    describe("POST /api/auth/logout", () => {
        it("should logout a user successfully", async () => {
            const response: Response = await request(app)
            .post("/api/auth/logout")
            .send({ token: "mock-jwt-token" });
            
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Logout successful");
        });
    });

    describe("GET /api/auth/refresh", () => {
        it("should refresh a user token", async () => {
            const response: Response = await request(app)
            .get("/api/auth/refresh");

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Token refreshed");
            expect(response.body.token).toBe("new-mock-jwt-token");
        });
    });
});