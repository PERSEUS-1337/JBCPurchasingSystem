import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Model, Document } from "mongoose";
import User from "../../src/models/userModel";
import { validSuperAdminUser, validUser } from "./mockUsers";
import { generateJWT } from "../../src/utils/authUtils";
import Supplier, { ISupplier } from "../../src/models/supplierModel";
import { validSupplierComplete, validSuppliersList } from "./mockSuppliers";
import Supply, { ISupply } from "../../src/models/supplyModel";
import { validSuppliesList, validSupplyComplete } from "./mockSupplies";

let mongoServer: MongoMemoryServer;

// Database Connection Management
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

// Generic Database Operations
export const clearCollection = async <T extends Document>(model: Model<T>) => {
  await model.deleteMany({});
};

export const saveAndReturn = async <T extends Document>(
  model: Model<T>,
  data: Partial<T>
): Promise<T> => {
  const document = new model(data);
  await document.save();
  const savedDocument = await model.findById(document._id).lean();
  if (!savedDocument) {
    throw new Error(`${model.modelName} not found after creation`);
  }
  return savedDocument as T;
};

export const saveMultipleAndReturn = async <T extends Document>(
  model: Model<T>,
  dataList: Partial<T>[]
): Promise<T[]> => {
  const documents = dataList.map((data) => new model(data));
  const insertedDocs = await model.insertMany(documents);
  const savedDocs = await model
    .find({
      _id: { $in: insertedDocs.map((doc) => doc._id) },
    })
    .lean();
  return savedDocs as T[];
};

// User-specific Operations
export const preSaveUserAndGenJWT = async (
  userData = validUser
): Promise<string> => {
  await clearCollection(User);
  const user = await new User(userData).save();
  return await generateJWT(user.userID);
};

export const preSaveUsersAndGenTokens = async (): Promise<{
  validToken: string;
  superAdminToken: string;
}> => {
  await clearCollection(User);

  const [user, superAdmin] = await Promise.all([
    new User(validUser).save(),
    new User(validSuperAdminUser).save(),
  ]);

  const [validToken, superAdminToken] = await Promise.all([
    generateJWT(user.userID),
    generateJWT(superAdmin.userID),
  ]);

  return { validToken, superAdminToken };
};

// Supplier-specific Operations
export const preSaveSupplier = async () => {
  await clearCollection(Supplier);
  await saveAndReturn(Supplier, validSupplierComplete);
};

export const preSaveMultipleSuppliers = async () => {
  await clearCollection(Supplier);
  await saveMultipleAndReturn(Supplier, validSuppliersList);
};

// Supply-specific Operations
export const preSaveSupply = async () => {
  await clearCollection(Supply);
  await saveAndReturn(Supply, validSupplyComplete);
};

export const preSaveMultipleSupplies = async () => {
  await clearCollection(Supply);
  await saveMultipleAndReturn(Supply, validSuppliesList);
};

// Type-safe convenience functions
export const saveSupplierAndReturn = async <T extends Partial<ISupplier>>(
  supplierData: T
): Promise<ISupplier> => {
  return saveAndReturn(Supplier, supplierData);
};

export const saveSupplyAndReturn = async <T extends Partial<ISupply>>(
  supplyData: T
): Promise<ISupply> => {
  return saveAndReturn(Supply, supplyData);
};

export const saveMultipleSuppliesAndReturn = async <T extends Partial<ISupply>>(
  suppliesData: T[]
): Promise<ISupply[]> => {
  return saveMultipleAndReturn(Supply, suppliesData);
};
