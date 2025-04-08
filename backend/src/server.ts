// This is where the server initialization happens, right after the app has been initialized

import dotenv from "dotenv";
import app from "./app";
// import { initDb } from "./config/database";

import mongoose from "mongoose";

// Load environment variables
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });


let isConnected: boolean = false;

const port: number = parseInt(process.env.PORT as string, 10) || 0;
const mongoUri: string = process.env.MONGO_URI as string;

const initDb = async (uri: string): Promise<void> => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(uri);

    isConnected = true; // Mark as connected
    console.log("Connected to MongoDB via Mongoose");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
};

// Start the server here (Immediately Invoked Function Expression (IIFE))
if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      await initDb(mongoUri);
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    } catch (err) {
      console.error("Failed to start application:", err);
      process.exit(1);
    }
  })();
}
