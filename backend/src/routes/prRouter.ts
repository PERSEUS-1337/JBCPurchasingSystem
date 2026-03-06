import express from "express";
import { authorizeJWT } from "../middlewares/authorizationMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { checkPRExists } from "../middlewares/prMiddleware";
import { prSchema, prUpdateSchema } from "../validators/prValidator";
import {
  prItemSchema,
  prItemUpdateSchema,
} from "../validators/prItemValidator";
import {
  // Purchase Request Controllers
  getAllPurchaseRequests,
  getPurchaseRequestByID,
  createPurchaseRequest,
  updatePurchaseRequest,
  deletePurchaseRequest,
  updatePurchaseRequestStatus,

  // PR Item Controllers
  getPurchaseRequestItems,
  addItemToPurchaseRequest,
  updatePurchaseRequestItem,
  removeItemFromPurchaseRequest,
  bulkUpdatePurchaseRequestItems,
} from "../controllers/prController";

const router = express.Router();

// Public test route
router.get("/hello", (_req, res) => {
  res
    .status(200)
    .json({ message: "This is the public purchase request route" });
});

// ===== PURCHASE REQUEST ROUTES =====

// List and Create Routes (No prID needed)
router.get("/", authorizeJWT, getAllPurchaseRequests);
router.post(
  "/",
  authorizeJWT,
  validateRequest(prSchema),
  createPurchaseRequest
);

// Purchase Request-specific Routes (Require prID)
router.get("/:prID", authorizeJWT, checkPRExists, getPurchaseRequestByID);
router.put(
  "/:prID",
  authorizeJWT,
  checkPRExists,
  validateRequest(prUpdateSchema),
  updatePurchaseRequest
);
router.patch(
  "/:prID/status",
  authorizeJWT,
  checkPRExists,
  updatePurchaseRequestStatus
);
router.delete("/:prID", authorizeJWT, checkPRExists, deletePurchaseRequest);

// ===== PR ITEM ROUTES (Nested under Purchase Request) =====

// Get all items for a Purchase Request
router.get(
  "/:prID/items",
  authorizeJWT,
  checkPRExists,
  getPurchaseRequestItems
);

// Add item to Purchase Request
router.post(
  "/:prID/items",
  authorizeJWT,
  checkPRExists,
  validateRequest(prItemSchema),
  addItemToPurchaseRequest
);

// Update specific item in Purchase Request
router.put(
  "/:prID/items/:itemID",
  authorizeJWT,
  checkPRExists,
  validateRequest(prItemUpdateSchema),
  updatePurchaseRequestItem
);

// Remove item from Purchase Request
router.delete(
  "/:prID/items/:itemID",
  authorizeJWT,
  checkPRExists,
  removeItemFromPurchaseRequest
);

// Bulk update/replace all items in Purchase Request
router.put(
  "/:prID/items",
  authorizeJWT,
  checkPRExists,
  bulkUpdatePurchaseRequestItems
);

export default router;
