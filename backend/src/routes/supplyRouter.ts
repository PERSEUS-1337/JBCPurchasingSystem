import express from "express";
import {
  createSupply,
  getAllSupplies,
  getSupplyByID,
  updateSupply,
  deleteSupply,
  searchSupplies,
  addSupplierToSupply,
  removeSupplierFromSupply,
  updateSupplyStatus,
  getSuppliersOfSupply,
} from "../controllers/supplyController";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  supplySchema,
  supplyUpdateSchema,
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

// Supplier Management Routes
router.get(
  "/:supplyID/suppliers",
  authorizeJWT,
  checkSupplyExists,
  getSuppliersOfSupply
);
router.post(
  "/:supplyID/suppliers",
  authorizeJWT,
  checkSupplyExists,
  addSupplierToSupply
);
router.delete(
  "/:supplyID/suppliers/:supplierID",
  authorizeJWT,
  checkSupplyExists,
  removeSupplierFromSupply
);

// Create Supply (No supplyID needed)
router.post("/", authorizeJWT, validateRequest(supplySchema), createSupply);

export default router;
