// This file configures the express application and mounts necessary routes without starting the server.

import express, { Application } from "express";
import authRouter from "./routes/authRouter";

const app: Application = express();

// Middleware to parse JSON
app.use(express.json());

// Mount the routes here
app.use("/api/auth", authRouter);

export default app;