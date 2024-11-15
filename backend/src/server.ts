import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";
import { MongoClient, Db } from "mongodb";

// Load environment variables
dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

const client = new MongoClient(process.env.MONGO_URI as string);
let db: Db;

async function connectToDatabase(): Promise<void> {
  try {
    await client.connect();
    db = client.db();

    console.log("Connected to MongoDB");

    // Setup route that uses db connection
    app.get("/", (req: Request, res: Response) => {
      res.send("Hello World");
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

connectToDatabase();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
