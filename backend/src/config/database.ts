// A dedicated file to handle the database initialization logic, which is why it is placed in the /config folder

import { MongoClient, Db } from "mongodb";

// Singleton pattern to reuse the db
let client: MongoClient;
let db: Db;

// Initialize MongoDB connection
export const initDb = async (uri: string): Promise<Db> => {
    if (client) {
        return db;
    }

    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db();
        console.log("Connected to MongoDB");
        return db;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
};

// Export DB instance for use in other files (such as controllers)
export const getDb = (): Db => {
    if (!db) {
        throw new Error("Database not initialized. Call initDb first");
    }
    return db;
}