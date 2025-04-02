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

router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public supply route" });
});

// Get Supply Info
router.get("/", authorizeJWT, getAllSupplies);
router.get("/search", authorizeJWT, searchSupplies);
router.get("/:supplyID", authorizeJWT, checkSupplyExists, getSupplyByID);

// Create Supply
router.post("/", authorizeJWT, validateRequest(supplySchema), createSupply);

// General Update
router.patch(
  "/:supplyID",
  authorizeJWT,
  checkSupplyExists,
  validateRequest(supplyUpdateSchema),
  updateSupply
);

// Delete Supply
router.delete("/:supplyID", authorizeJWT, checkSupplyExists, deleteSupply);

// Update Supply Status
router.patch(
  "/:supplyID/status",
  authorizeJWT,
  checkSupplyExists,
  updateSupplyStatus
);

// Manage Suppliers for a Supply
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

export default router;
