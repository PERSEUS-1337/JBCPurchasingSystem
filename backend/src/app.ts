// This file configures the express application and mounts necessary routes without starting the server.

import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./docs/openapi";

const app: Application = express();

// Middleware to parse JSON
app.use(express.json());

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

// Use Morgan for logging requests
app.use(morgan(":method :url :status :response-time ms - :remote-addr"));

// Custom logging middleware for additional details
// app.use((req: Request, res: Response, next: NextFunction) => {
//   console.log(
//     `[${new Date().toISOString()}] ${req.method} request to ${req.url} from ${
//       req.ip
//     }`
//   );
//   console.log(`Headers: ${JSON.stringify(req.headers)}`);
//   next();
// });

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is running!",
  });
});

app.get("/api/docs.json", (_req: Request, res: Response) => {
  res.status(200).json(openApiSpec);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import supplierRouter from "./routes/supplierRouter";
import supplyRouter from "./routes/supplyRouter";
import prRouter from "./routes/prRouter";

// Mount the routes here
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/supply", supplyRouter);
app.use("/api/pr", prRouter);

export default app;
