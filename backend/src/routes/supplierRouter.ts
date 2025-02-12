import express from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierByID,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  addContactNumber,
  removeContactNumber,
  addEmail,
  removeEmail,
  addContactPerson,
  updateContactPerson,
  removeContactPerson,
  addSupply,
  removeSupply,
  addDocs,
  removeDocs,
} from "../controllers/supplierController";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  supplierSchema,
  supplierUpdateSchema,
} from "../validators/supplierValidator";
import {
  authorizeJWT,
} from "../middlewares/authorizationMiddleware";

const router = express.Router();

router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public supplier route" });
});

// Get Supplier Info
router.get("/search", authorizeJWT, searchSuppliers);
router.get("/all", authorizeJWT, getAllSuppliers);
router.get("/:supplierID", authorizeJWT, getSupplierByID);

// Create Supplier
router.post("/", authorizeJWT, validateRequest(supplierSchema), createSupplier);

// General Update
router.patch(
  "/:supplierID",
  authorizeJWT,
  validateRequest(supplierUpdateSchema),
  updateSupplier
);

// Delete Supplier
router.delete("/:supplierID", authorizeJWT, deleteSupplier);

// // TODO: Contact Numbers
// // Add
// router.post("/:supplierID/contact-numbers", authorizeJWT, addContactNumber);
// // Remove by value / index
// router.delete("/:supplierID/contact-numbers", authorizeJWT, removeContactNumber);

// // TODO: Emails
// // Add
// router.post("/:supplierID/emails", authorizeJWT, addEmail);
// // Remove by value / index
// router.delete("/:supplierID/emails", authorizeJWT, removeEmail);

// // TODO: Contact Persons
// // Add
// router.post("/:supplierID/contact-persons", authorizeJWT, addContactPerson);
// // Update by index
// router.post("/:supplierID/contact-persons/:idx", authorizeJWT, updateContactPerson);
// // Remove by index
// router.delete("/:supplierID/contact-persons/:idx", authorizeJWT, removeContactPerson);

// // TODO: Supplies
// // Add
// router.post("/:supplierID/supplies", authorizeJWT, addSupply);
// // Remove by supplyID
// router.delete("/:supplierID/supplies/:supplyID", authorizeJWT, removeSupply);

// // TODO: Documentation
// // Add document path
// router.post("/:supplierID/docs", authorizeJWT, addDocs);
// // Remove by index
// router.delete("/:supplierID/docs", authorizeJWT, removeDocs);


// router.patch(
//   "/:id/status",
//   authorizeJWT,
//   authorizeSuperAdmin,
//   updateSupplierStatus
// );

// ===============================================
// // ✅ Add documentation to supplier
// router.patch("/:id/add-documentation", addSupplierDocumentation);
// // ✅ Remove specific documentation from supplier
// router.patch("/:id/remove-documentation", removeSupplierDocumentation);

export default router;
