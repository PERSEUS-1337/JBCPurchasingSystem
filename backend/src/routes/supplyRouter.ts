import express from "express";
import {
  createSupply,
  getAllSupplies,
  getSupplyByID,
  updateSupply,
  deleteSupply,
  searchSupplies,
  updateSupplyStatus,
  getSuppliersOfSupply,
  addSupplierPricing,
  updateSupplierPricing,
  removeSupplierPricing,
} from "../controllers/supplyController";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  supplySchema,
  supplyUpdateSchema,
  supplierPricingSchema,
  supplierPricingUpdateSchema,
} from "../validators/supplyValidator";
import { authorizeJWT } from "../middlewares/authorizationMiddleware";
import { checkSupplyExists } from "../middlewares/supplyMiddleware";

const router = express.Router();

// Public route
router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public supply route" });
});

// List and Search Routes (No supplyID needed)
router.get("/", authorizeJWT, getAllSupplies);
router.get("/search", authorizeJWT, searchSupplies);

// Supply-specific Routes (Require supplyID)
router.get("/:supplyID", authorizeJWT, checkSupplyExists, getSupplyByID);
router.patch(
  "/:supplyID",
  authorizeJWT,
  checkSupplyExists,
  validateRequest(supplyUpdateSchema),
  updateSupply
);
router.delete("/:supplyID", authorizeJWT, checkSupplyExists, deleteSupply);
router.patch(
  "/:supplyID/status",
  authorizeJWT,
  checkSupplyExists,
  updateSupplyStatus
);

// Supplier Pricing Management Routes
router.get(
  "/:supplyID/suppliers",
  authorizeJWT,
  checkSupplyExists,
  getSuppliersOfSupply
);
router.post(
  "/:supplyID/supplier-pricing",
  authorizeJWT,
  checkSupplyExists,
  validateRequest(supplierPricingSchema),
  addSupplierPricing
);
router.patch(
  "/:supplyID/supplier-pricing/:supplier",
  authorizeJWT,
  checkSupplyExists,
  validateRequest(supplierPricingUpdateSchema),
  updateSupplierPricing
);
router.delete(
  "/:supplyID/supplier-pricing/:supplier",
  authorizeJWT,
  checkSupplyExists,
  removeSupplierPricing
);

// Create Supply (No supplyID needed)
router.post("/", authorizeJWT, validateRequest(supplySchema), createSupply);

export default router;
