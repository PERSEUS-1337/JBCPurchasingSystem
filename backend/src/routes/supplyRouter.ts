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

const router = express.Router();

router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public supply route" });
});

// Get Supply Info
router.get("/", authorizeJWT, getAllSupplies);
router.get("/search", authorizeJWT, searchSupplies);
router.get("/:supplyID", authorizeJWT, getSupplyByID);

// Create Supply
router.post("/", authorizeJWT, validateRequest(supplySchema), createSupply);

// General Update
router.patch(
  "/:supplyID",
  authorizeJWT,
  validateRequest(supplyUpdateSchema),
  updateSupply
);

// Delete Supply
router.delete("/:supplyID", authorizeJWT, deleteSupply);

// Update Supply Status
router.patch("/:supplyID/status", authorizeJWT, updateSupplyStatus);

// Manage Suppliers for a Supply
router.get("/:supplyID/suppliers", authorizeJWT, getSuppliersOfSupply);
router.post("/:supplyID/suppliers", authorizeJWT, addSupplierToSupply);
router.delete(
  "/:supplyID/suppliers/:supplierID",
  authorizeJWT,
  removeSupplierFromSupply
);

export default router;
