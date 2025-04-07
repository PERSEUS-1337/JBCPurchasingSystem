import { Request, Response } from "express";
import Supply, { ISupply, ISupplierPricing } from "../models/supplyModel";
import {
  SupplyInput,
  SupplierPricingInput,
} from "../validators/supplyValidator";
import { sendResponse, sendError } from "../utils/responseUtils";
import { Types } from "mongoose";
import mongoose from "mongoose";

/**
 * Retrieves a supply by its unique supply ID
 * @param req Express Request object containing supplyID in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const getSupplyByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    sendResponse(res, 200, "Supply details retrieved successfully", req.supply);
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Searches supplies by name using case-insensitive matching
 * @param req Express Request object containing search query in query params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 500 if server error occurs
 */
export const searchSupplies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query) {
      sendResponse(res, 200, "No supplies matched your search", []);
      return;
    }
    const supplies = await Supply.find({
      name: { $regex: query, $options: "i" },
    });
    sendResponse(res, 200, "Supplies retrieved", supplies);
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Retrieves all supplies in the system, excluding MongoDB internal fields
 * @param _req Express Request object (unused)
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 500 if server error occurs
 */
export const getAllSupplies = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const supplies = await Supply.find({}, { _id: 0, __v: 0 });
    sendResponse(
      res,
      200,
      supplies.length ? "Supplies retrieved successfully" : "No data yet",
      supplies
    );
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Creates a new supply after checking for duplicate supply IDs
 * @param req Express Request object containing supply data in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 400 if supply ID already exists
 * @throws 500 if server error occurs
 */
export const createSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newSupplyData: SupplyInput = req.body;
    const isDuplicate = await Supply.checkDuplicateSupply(
      newSupplyData.supplyID
    );
    if (isDuplicate) {
      sendError(res, 400, "Supply ID already exists");
      return;
    }
    const newSupply: ISupply = new Supply(newSupplyData);
    await newSupply.save();
    sendResponse(res, 201, "Supply created successfully", newSupply);
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Updates a supply's details while preventing modification of immutable fields
 * @param req Express Request object containing supplyID in params and update data in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 400 if attempting to update supplyID or no valid update data provided
 * @throws 500 if server error occurs
 */
export const updateSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updates = req.body;
    const supply = req.supply; // Supply is already attached by the middleware

    if (!supply) {
      return sendError(res, 500, "Supply not found in request");
    }

    // Prevent updating supplyID
    if (updates.supplyID) {
      return sendError(res, 400, "Cannot update supplyID");
    }

    // Update the supply
    const updatedSupply = await Supply.findOneAndUpdate(
      { supplyID: supply.supplyID },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedSupply) {
      return sendError(res, 500, "Failed to update supply");
    }

    sendResponse(res, 200, "Supply updated successfully", updatedSupply);
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Deletes a supply from the system
 * @param req Express Request object containing supplyID in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 500 if server error occurs
 */
export const deleteSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supply = req.supply; // Supply is already attached by the middleware

    if (!supply) {
      return sendError(res, 500, "Supply not found in request");
    }

    const deletedSupply = await Supply.findOneAndDelete({
      supplyID: supply.supplyID,
    });
    if (!deletedSupply) {
      return sendError(res, 500, "Failed to delete supply");
    }

    sendResponse(res, 200, "Supply deleted successfully", deletedSupply);
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Updates only the status field of a supply
 * @param req Express Request object containing supplyID in params and status in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 500 if server error occurs
 */
export const updateSupplyStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const supply = req.supply; // Supply is already attached by the middleware

    if (!supply) {
      return sendError(res, 500, "Supply not found in request");
    }

    const updatedSupply = await Supply.findOneAndUpdate(
      { supplyID: supply.supplyID },
      { status },
      { new: true }
    );

    if (!updatedSupply) {
      return sendError(res, 500, "Failed to update supply status");
    }

    sendResponse(res, 200, "Supply status updated successfully", updatedSupply);
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Retrieves all suppliers associated with a specific supply
 * @param req Express Request object containing supplyID in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 500 if server error occurs
 */
export const getSuppliersOfSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supply = req.supply; // Supply is already attached by the middleware

    if (!supply) {
      return sendError(res, 500, "Supply not found in request");
    }

    // Extract unique suppliers from supplierPricing
    const suppliers = supply.supplierPricing.map(
      (pricing: ISupplierPricing) => pricing.supplier
    );
    sendResponse(res, 200, "Suppliers retrieved successfully", suppliers);
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Adds pricing information for a supplier to a supply
 * @param req Express Request object containing supplyID in params and pricing details in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 400 if supplier pricing already exists
 * @throws 500 if server error occurs
 */
export const addSupplierPricing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supply = req.supply; // Supply is already attached by the middleware
    const pricingData: SupplierPricingInput = {
      ...req.body,
      supplier: new mongoose.Types.ObjectId(req.body.supplier),
    };

    if (!supply) {
      return sendError(res, 500, "Supply not found in request");
    }

    // Check if supplier pricing already exists
    const existingPricing = supply.supplierPricing.find(
      (pricing) =>
        pricing.supplier.toString() === pricingData.supplier.toString()
    );

    if (existingPricing) {
      return sendError(
        res,
        400,
        "Supplier pricing already exists for this supplier"
      );
    }

    // Add the new supplier pricing using $push
    const updatedSupply = await Supply.findOneAndUpdate(
      { supplyID: supply.supplyID },
      { $push: { supplierPricing: pricingData } },
      { new: true }
    );

    if (!updatedSupply) {
      return sendError(res, 500, "Failed to add supplier pricing");
    }

    sendResponse(
      res,
      200,
      "Supplier pricing added successfully",
      updatedSupply
    );
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Updates pricing information for a supplier of a supply
 * @param req Express Request object containing supplyID and supplier in params, and updated pricing in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supplier pricing not found
 * @throws 500 if server error occurs
 */
export const updateSupplierPricing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supply = req.supply; // Supply is already attached by the middleware
    const { supplier } = req.params;
    const pricingData: SupplierPricingInput = {
      ...req.body,
      supplier: new mongoose.Types.ObjectId(supplier),
    };
    // console.log("oks")

    if (!supply) {
      return sendError(res, 500, "Supply not found in request");
    }

    // Update the supplier pricing using array update operators
    const updatedSupply = await Supply.findOneAndUpdate(
      {
        supplyID: supply.supplyID,
        "supplierPricing.supplier": supplier,
      },
      {
        $set: {
          "supplierPricing.$": pricingData,
        },
      },
      { new: true }
    );

    if (!updatedSupply) {
      return sendError(res, 404, "Supplier pricing not found");
    }

    sendResponse(
      res,
      200,
      "Supplier pricing updated successfully",
      updatedSupply
    );
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

/**
 * Removes pricing information for a supplier from a supply
 * @param req Express Request object containing supplyID and supplier in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supplier pricing not found
 * @throws 500 if server error occurs
 */
export const removeSupplierPricing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supply = req.supply; // Supply is already attached by the middleware
    const { supplier } = req.params;

    if (!supply) {
      return sendError(res, 500, "Supply not found in request");
    }

    // Check if supplier pricing exists
    const supplierPricingExists = supply.supplierPricing.some(
      (pricing) => pricing.supplier.toString() === supplier
    );

    if (!supplierPricingExists) {
      return sendError(res, 404, "Supplier pricing not found");
    }

    // Remove the supplier pricing
    const updatedSupply = await Supply.findOneAndUpdate(
      { supplyID: supply.supplyID },
      { $pull: { supplierPricing: { supplier } } },
      { new: true }
    );

    if (!updatedSupply) {
      return sendError(res, 500, "Failed to remove supplier pricing");
    }

    sendResponse(
      res,
      200,
      "Supplier pricing removed successfully",
      updatedSupply
    );
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};

// ----- Additional Endpoints for Nested Fields -----

/**
 * Adds a specification to a supply
 * @param req Express Request object containing supplyID in params and specification details in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 400 if specification already exists
 * @throws 500 if server error occurs
 */
export const addSpecification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const { specProperty, specValue } = req.body;
    const supply = await Supply.findOne({ supplyID });
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    // Check if a specification with the same property exists
    const exists = supply.specifications.find(
      (spec) => spec.specProperty === specProperty
    );
    if (exists) {
      res
        .status(400)
        .json({ message: "Specification already exists for this property" });
      return;
    }
    supply.specifications.push({ specProperty, specValue });
    await supply.save();
    res.status(200).json({
      message: "Specification added successfully",
      data: supply,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Updates a specification of a supply
 * @param req Express Request object containing supplyID in params and updated specification in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply or specification not found
 * @throws 500 if server error occurs
 */
export const updateSpecification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const { specProperty, specValue } = req.body;
    const supply = await Supply.findOne({ supplyID });
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    const specIndex = supply.specifications.findIndex(
      (spec) => spec.specProperty === specProperty
    );
    if (specIndex === -1) {
      res.status(404).json({ message: "Specification not found" });
      return;
    }
    supply.specifications[specIndex].specValue = specValue;
    await supply.save();
    res.status(200).json({
      message: "Specification updated successfully",
      data: supply,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Removes a specification from a supply
 * @param req Express Request object containing supplyID and specProperty in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const removeSpecification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID, specProperty } = req.params;
    const supply = await Supply.findOneAndUpdate(
      { supplyID },
      { $pull: { specifications: { specProperty } } },
      { new: true }
    );
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res.status(200).json({
      message: "Specification removed successfully",
      data: supply,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Adds an attachment to a supply
 * @param req Express Request object containing supplyID in params and attachment in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const addAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const { attachment } = req.body;
    const supply = await Supply.findOneAndUpdate(
      { supplyID },
      { $addToSet: { attachments: attachment } },
      { new: true }
    );
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res.status(200).json({
      message: "Attachment added successfully",
      data: supply,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Removes an attachment from a supply
 * @param req Express Request object containing supplyID and attachment in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const removeAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID, attachment } = req.params;
    const supply = await Supply.findOneAndUpdate(
      { supplyID },
      { $pull: { attachments: attachment } },
      { new: true }
    );
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res.status(200).json({
      message: "Attachment removed successfully",
      data: supply,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
