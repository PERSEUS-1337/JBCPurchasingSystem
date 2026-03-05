import express from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierByID,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  addSupply,
  removeSupply,
  updateSupplierStatus,
  getSuppliesOfSupplier,
} from "../controllers/supplierController";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  supplierSchema,
  supplierUpdateSchema,
} from "../validators/supplierValidator";
import { authorizeJWT } from "../middlewares/authorizationMiddleware";

const router = express.Router();

router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public supplier route" });
});

// Get Supplier Info
router.get("/", authorizeJWT, getAllSuppliers);
router.get("/search", authorizeJWT, searchSuppliers);
router.get("/:supplierID", authorizeJWT, getSupplierByID);

// Create Supplier
router.post("/", authorizeJWT, validateRequest(supplierSchema), createSupplier);

// General Update
router.patch(
  "/:supplierID",
  authorizeJWT,
  validateRequest(supplierUpdateSchema),
  updateSupplier,
);

// Delete Supplier
router.delete("/:supplierID", authorizeJWT, deleteSupplier);

router.patch("/:supplierID/status", authorizeJWT, updateSupplierStatus);

// TODO: Supplies
// Get
router.get("/:supplierID/supplies", authorizeJWT, getSuppliesOfSupplier);
// Add
router.post("/:supplierID/supplies", authorizeJWT, addSupply);
// Remove by supplyID
router.delete("/:supplierID/supplies/:supplyID", authorizeJWT, removeSupply);

export default router;
