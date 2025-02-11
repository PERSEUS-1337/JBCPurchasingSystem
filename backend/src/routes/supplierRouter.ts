import express from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierByID,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  updateSupplierStatus,
} from "../controllers/supplierController";
import { validateRequest } from "../middlewares/validationMiddleware";
import { supplierSchema, supplierUpdateSchema } from "../validators/supplierValidator";
import { authorizeJWT, authorizeSuperAdmin } from "../middlewares/authorizationMiddleware";

const router = express.Router();

router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public supplier route" });
});

// ========================== SUPPLIER ROUTES ========================== //
router.get("/search", authorizeJWT, searchSuppliers);
router.get("/all", authorizeJWT, getAllSuppliers);
router.get("/:supplierID", authorizeJWT, getSupplierByID);

router.post("/", authorizeJWT, validateRequest(supplierSchema), createSupplier);

router.put(
  "/:supplierID",
  authorizeJWT,
  validateRequest(supplierUpdateSchema),
  updateSupplier
);

router.patch("/:id/status", authorizeJWT, authorizeSuperAdmin, updateSupplierStatus);

router.delete("/:supplierID", authorizeJWT, deleteSupplier);

// ===============================================
// // ✅ Add documentation to supplier
// router.patch("/:id/add-documentation", addSupplierDocumentation);
// // ✅ Remove specific documentation from supplier
// router.patch("/:id/remove-documentation", removeSupplierDocumentation);

export default router;
