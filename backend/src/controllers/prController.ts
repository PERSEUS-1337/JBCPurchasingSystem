import { Request, Response } from "express";
import PurchaseRequest, { IPurchaseRequest } from "../models/prModel";
import PRItem, { IPRItem } from "../models/prItemModel";
import { sendResponse, sendError } from "../utils/responseUtils";

// ===== PURCHASE REQUEST CONTROLLERS =====

/**
 * Get all Purchase Requests with optional filtering
 */
export const getAllPurchaseRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, requestedBy, projCode, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter: any = {};
    if (status) filter.prStatus = status;
    if (requestedBy) filter.requestedBy = requestedBy;
    if (projCode) filter.projCode = projCode;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get purchase requests with pagination
    const purchaseRequests = await PurchaseRequest.find(filter)
      .populate("itemsRequested")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalCount = await PurchaseRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: purchaseRequests,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalItems: totalCount,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

/**
 * Get Purchase Request by ID
 */
export const getPurchaseRequestByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Purchase request is already attached by the middleware
    const purchaseRequest = req.purchaseRequest!;

    // Populate the purchase request with items if needed
    const populatedPR = await PurchaseRequest.findOne({
      prID: purchaseRequest.prID,
    }).populate("itemsRequested");

    sendResponse(
      res,
      200,
      "Purchase request retrieved successfully",
      populatedPR
    );
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

/**
 * Create new Purchase Request
 */
export const createPurchaseRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const purchaseRequestData: Partial<IPurchaseRequest> = req.body;

    // Check for duplicate prID
    const isDuplicate = await PurchaseRequest.checkDuplicatePR(
      purchaseRequestData.prID!
    );
    if (isDuplicate) {
      sendError(res, 409, "Purchase request with this ID already exists");
      return;
    }

    // Create new purchase request
    const newPurchaseRequest = new PurchaseRequest(purchaseRequestData);
    const savedPR = await newPurchaseRequest.save();

    sendResponse(res, 201, "Purchase request created successfully", savedPR);
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

/**
 * Update Purchase Request
 */
export const updatePurchaseRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updateData = req.body;
    const purchaseRequest = req.purchaseRequest!; // Purchase request is already attached by the middleware

    // Prevent updating prID
    if (updateData.prID) {
      sendError(res, 400, "Cannot update prID");
      return;
    }

    const updatedPR = await PurchaseRequest.findOneAndUpdate(
      { prID: purchaseRequest.prID },
      updateData,
      { new: true, runValidators: true }
    ).populate("itemsRequested");

    if (!updatedPR) {
      sendError(res, 500, "Internal server error");
      return;
    }

    sendResponse(res, 200, "Purchase request updated successfully", updatedPR);
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

/**
 * Update Purchase Request Status (for workflow transitions)
 */
export const updatePurchaseRequestStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { prStatus, recommendedBy, approvedBy } = req.body;
    const purchaseRequest = req.purchaseRequest!; // Purchase request is already attached by the middleware

    const updateData: any = { prStatus };
    if (recommendedBy) updateData.recommendedBy = recommendedBy;
    if (approvedBy) updateData.approvedBy = approvedBy;

    const updatedPR = await PurchaseRequest.findOneAndUpdate(
      { prID: purchaseRequest.prID },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPR) {
      sendError(res, 500, "Internal server error");
      return;
    }

    sendResponse(
      res,
      200,
      "Purchase request status updated successfully",
      updatedPR
    );
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

/**
 * Delete Purchase Request
 */
export const deletePurchaseRequest = async (req: Request, res: Response) => {
  try {
    const purchaseRequest = req.purchaseRequest!; // Purchase request is already attached by the middleware

    // Delete associated PR items first
    await PRItem.deleteMany({ prID: purchaseRequest.prID });

    // Delete the purchase request
    await PurchaseRequest.deleteOne({ prID: purchaseRequest.prID });

    sendResponse(
      res,
      200,
      "Purchase request and associated items deleted successfully"
    );
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

// ===== PR ITEM CONTROLLERS =====

/**
 * Get all items for a Purchase Request
 */
export const getPurchaseRequestItems = async (req: Request, res: Response) => {
  try {
    const purchaseRequest = req.purchaseRequest!; // Purchase request is already attached by the middleware

    // Get all items for this PR
    const items = await PRItem.find({ prID: purchaseRequest.prID });

    sendResponse(
      res,
      200,
      "Purchase request items retrieved successfully",
      items
    );
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

/**
 * Add item to Purchase Request
 */
export const addItemToPurchaseRequest = async (req: Request, res: Response) => {
  try {
    const purchaseRequest = req.purchaseRequest!; // Purchase request is already attached by the middleware
    const itemData: Partial<IPRItem> = {
      ...req.body,
      prID: purchaseRequest.prID,
    };

    // Create new PR item
    const newItem = new PRItem(itemData);
    const savedItem = await newItem.save();

    // Add item reference to purchase request
    await PurchaseRequest.findOneAndUpdate(
      { prID: purchaseRequest.prID },
      {
        $push: { itemsRequested: savedItem._id },
        $inc: { totalCost: savedItem.totalPrice },
      }
    );

    sendResponse(
      res,
      201,
      "Item added to purchase request successfully",
      savedItem
    );
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

/**
 * Update specific item in Purchase Request
 */
export const updatePurchaseRequestItem = async (
  req: Request,
  res: Response
) => {
  try {
    const { itemID } = req.params;
    const purchaseRequest = req.purchaseRequest!; // Purchase request is already attached by the middleware
    const updateData = req.body;

    // Find the current item to get old totalPrice
    const currentItem = await PRItem.findOne({
      prItemID: itemID,
      prID: purchaseRequest.prID,
    });
    if (!currentItem) {
      sendError(res, 404, "Item not found in this purchase request");
      return;
    }

    const oldTotalPrice = currentItem.totalPrice;

    // Update the item
    const updatedItem = await PRItem.findOneAndUpdate(
      { prItemID: itemID, prID: purchaseRequest.prID },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      sendError(res, 404, "Item not found");
      return;
    }

    // Update purchase request total cost
    const costDifference = updatedItem.totalPrice - oldTotalPrice;
    await PurchaseRequest.findOneAndUpdate(
      { prID: purchaseRequest.prID },
      { $inc: { totalCost: costDifference } }
    );

    sendResponse(res, 200, "Item updated successfully", updatedItem);
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

/**
 * Remove item from Purchase Request
 */
export const removeItemFromPurchaseRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const { itemID } = req.params;
    const purchaseRequest = req.purchaseRequest!; // Purchase request is already attached by the middleware

    // Find and delete the item
    const deletedItem = await PRItem.findOneAndDelete({
      prItemID: itemID,
      prID: purchaseRequest.prID,
    });

    if (!deletedItem) {
      sendError(res, 404, "Item not found in this purchase request");
      return;
    }

    // Remove item reference from purchase request and update total cost
    await PurchaseRequest.findOneAndUpdate(
      { prID: purchaseRequest.prID },
      {
        $pull: { itemsRequested: deletedItem._id },
        $inc: { totalCost: -deletedItem.totalPrice },
      }
    );

    sendResponse(res, 200, "Item removed from purchase request successfully");
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

/**
 * Bulk update/replace all items in Purchase Request
 */
export const bulkUpdatePurchaseRequestItems = async (
  req: Request,
  res: Response
) => {
  try {
    const purchaseRequest = req.purchaseRequest!; // Purchase request is already attached by the middleware
    const { items }: { items: Partial<IPRItem>[] } = req.body;

    // Delete existing items
    await PRItem.deleteMany({ prID: purchaseRequest.prID });

    // Create new items
    const newItems = items.map((item) => ({
      ...item,
      prID: purchaseRequest.prID,
    }));
    const savedItems = await PRItem.insertMany(newItems);

    // Calculate new total cost
    const newTotalCost = savedItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    // Update purchase request with new item references and total cost
    await PurchaseRequest.findOneAndUpdate(
      { prID: purchaseRequest.prID },
      {
        itemsRequested: savedItems.map((item) => item._id),
        totalCost: newTotalCost,
      }
    );

    sendResponse(res, 200, "Items updated successfully", savedItems);
  } catch (error) {
    sendError(
      res,
      500,
      "Internal server error",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
