import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import User from "../../src/models/userModel";
import { validUser } from "./mockUsers";
import { generateJWT } from "../../src/utils/authUtils";

let mongoServer: MongoMemoryServer;

export const connectDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

export const dropDB = async () => {
  await mongoose.connection.dropDatabase();
};

export const disconnectDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

// Delete Existing and Pre-Save Valid User
export const preSaveValidUser = async () => {
  await User.deleteMany({});
  await new User(validUser).save();
};

export const preSaveUserAndGenJWT = async (): Promise<string> => {
  await User.deleteMany({});
  const user = await new User(validUser).save();
  return await generateJWT(user.userID);
};
