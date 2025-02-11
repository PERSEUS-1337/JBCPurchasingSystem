import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import User from "../../src/models/userModel";
import { validSuperAdminUser, validUser } from "./mockUsers";
import { generateJWT } from "../../src/utils/authUtils";
import Supplier, { ISupplier } from "../../src/models/supplierModel";
import { validSupplierComplete, validSupplierMinimum, validSuppliersList } from "./mockSuppliers";

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
  await new Supplier(validSupplierMinimum).save();
  const savedSuppliers = await Supplier.find({});
  console.log("Saved Suppliers:", savedSuppliers);
};

export const preSaveMultipleSuppliers = async () => {
  await Supplier.deleteMany({});
  await Supplier.insertMany(validSuppliersList);

  // Fetch and log the saved suppliers
  // const savedSuppliers = await Supplier.find({});
  // console.log("Saved Suppliers:", savedSuppliers);
};

export const deleteMultipleSuppliers = async () => {
  await Supplier.deleteMany({});
};

export const saveSupplierAndReturn = async <T extends Partial<ISupplier>>(
  supplierData: T
): Promise<ISupplier> => {
  const supplier = new Supplier(supplierData);
  await supplier.save();
  const savedSupplier = await Supplier.findById(supplier._id).lean();
  if (!savedSupplier) {
    throw new Error("Supplier not found after creation");
  }
  return savedSupplier;
};
