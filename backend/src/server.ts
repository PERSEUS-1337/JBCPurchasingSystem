// This is where the server initialization happens, right after the app has been initialized

import dotenv from "dotenv";
import app from "./app";
import { initDb } from "./config/database";

// Load environment variables
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

const port: number = parseInt(process.env.PORT as string, 10) || 3000;
const mongoUri: string = process.env.MONGO_URI as string;

// Start the server here
(async () => {
  try {
    // Init db connection
    await initDb(mongoUri);

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
})();