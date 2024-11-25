// This file configures the express application and mounts necessary routes without starting the server.

import express, { Application, Request, Response } from "express";
import authRouter from "./routes/authRouter";

const app: Application = express();

// Middleware to parse JSON
app.use(express.json());

// Health check route
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running!"
    });
});

// Mount the routes here
app.use("/api/auth", authRouter);

export default app;