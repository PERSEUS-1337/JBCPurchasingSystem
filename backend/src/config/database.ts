// A dedicated file to handle the database initialization logic, which is why it is placed in the /config folder

import mongoose from "mongoose";

// Singleton pattern to reuse the db
let isConnected: boolean = false; // track connection state

// Initialize MongoDB connection using mongoose
export const initDb = async (uri: string): Promise<void> => {
  if (isConnected) {
    return; // Already connected
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // Increase timeout if needed
      bufferCommands: false, // Disable buffering
    });

    isConnected = true; // Mark as connected
    console.log("Connected to MongoDB via Mongoose");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
};

// Export mongoose for use in other files (such as controllers)
export const getDb = (): mongoose.Mongoose => {
  if (!isConnected) {
    throw new Error("Database not initialized. Call initDb first");
  }
  return mongoose; // Return mongoose instance, which is connected
};
