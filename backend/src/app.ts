// This file configures the express application and mounts necessary routes without starting the server.

import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";

const app: Application = express();

// Middleware to parse JSON
app.use(express.json());

// Use Morgan for logging requests
// app.use(morgan(":method :url :status :response-time ms - :remote-addr"));

// // Custom logging middleware for additional details
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

import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import supplierRouter from "./routes/supplierRouter";
import supplyRouter from "./routes/supplyRouter";
// Mount the routes here
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/supply", supplyRouter);

export default app;
