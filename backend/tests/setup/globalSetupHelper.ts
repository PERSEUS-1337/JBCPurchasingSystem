import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import User from "../../src/models/userModel";
import { validSuperAdminUser, validUser } from "./mockUsers";
import { generateJWT } from "../../src/utils/authUtils";
import Supplier from "../../src/models/supplierModel";
import { validSupplier } from "./mockSuppliers";

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

export const preSaveSuperAdminUser = async () => {
  await User.deleteMany({});
  await new User(validUser).save();
};

export const preSaveUserAndGenJWT = async (): Promise<string> => {
  await User.deleteMany({});
  const user = await new User(validUser).save();
  return await generateJWT(user.userID);
};

export const preSaveSuperAdminAndGenJWT = async (): Promise<string> => {
  await User.deleteMany({});
  const user = await new User(validSuperAdminUser).save();
  return await generateJWT(user.userID);
};

export const preSaveUsersAndGenTokens = async (): Promise<{
  validToken: string;
  superAdminToken: string;
}> => {
  await User.deleteMany({}); // Clear the users

  // Save regular user and generate token
  const user = await new User(validUser).save();
  const validToken = await generateJWT(user.userID);

  // Save super admin user and generate token
  const superAdmin = await new User(validSuperAdminUser).save();
  const superAdminToken = await generateJWT(superAdmin.userID);

  // Return both tokens
  return { validToken, superAdminToken };
};

export const deleteAllUsers = async () => {
  await User.deleteMany({});
};

export const preSaveSupplier = async () => {
  await Supplier.deleteMany({});
  await new Supplier(validSupplier).save();
};
export const preSaveMultipleSuppliers = async () => {};
