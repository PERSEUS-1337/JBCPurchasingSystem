import mongoose from "mongoose";
import PurchaseRequest from "../../src/models/prModel";
import {
  connectDB,
  disconnectDB,
  clearCollection,
  saveAndReturn,
} from "../setup/globalSetupHelper";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import {
  apiPurchaseRequestID,
  apiPurchaseRequestMain,
} from "../setup/refRoutes";

describe("Purchase Request Routes", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await clearCollection(PurchaseRequest);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe(`GET ${apiPurchaseRequestMain}`, () => {});
  describe(`GET ${apiPurchaseRequestID(":prID")}`, () => {});
  describe(`POST ${apiPurchaseRequestMain}`, () => {});
});
