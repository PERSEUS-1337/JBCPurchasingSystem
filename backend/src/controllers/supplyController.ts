import { Request, Response } from "express";
import Supply, { ISupply } from "../models/supplyModel";
import { SupplyInput } from "../validators/supplyValidator";

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
    const { supplyID } = req.params;
    const supply = await Supply.findOne({ supplyID });
    if (!supply) {
      res.status(404).json({ message: "Supply not found", data: null });
      return;
    }
    res
      .status(200)
      .json({ message: "Supply details retrieved successfully", data: supply });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
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
      res
        .status(200)
        .json({ message: "No supplies matched your search", data: [] });
      return;
    }
    const supplies = await Supply.find({
      name: { $regex: query, $options: "i" },
    });
    res.status(200).json({ message: "Supplies retrieved", data: supplies });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
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
    res.status(200).json({
      message: supplies.length
        ? "Supplies retrieved successfully"
        : "No data yet",
      data: supplies,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
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
      res.status(400).json({ message: "Supply ID already exists", data: null });
      return;
    }
    const newSupply: ISupply = new Supply(newSupplyData);
    await newSupply.save();
    res.status(201).json({
      message: "Supply created successfully",
      data: newSupply,
      createdAt: newSupply.createdAt,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Updates a supply's details while preventing modification of immutable fields
 * @param req Express Request object containing supplyID in params and update data in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 400 if attempting to update supplyID or no valid update data provided
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const updateSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const updates = req.body;

    if (updates.supplyID) {
      res.status(400).json({ message: "Cannot update supplyID" });
      return;
    }
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No valid update data provided" });
      return;
    }

    const supply = await Supply.findOneAndUpdate({ supplyID }, updates, {
      new: true,
      runValidators: true,
    });
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Supply updated successfully", data: supply });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Deletes a supply from the system
 * @param req Express Request object containing supplyID in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const deleteSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const supply = await Supply.findOneAndDelete({ supplyID });
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Supply deleted successfully", data: supply });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Updates only the status field of a supply
 * @param req Express Request object containing supplyID in params and status in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const updateSupplyStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const { status } = req.body;
    const supply = await Supply.findOneAndUpdate(
      { supplyID },
      { status },
      { new: true, runValidators: true }
    );
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Supply status updated successfully", data: supply });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Retrieves all suppliers associated with a specific supply
 * @param req Express Request object containing supplyID in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const getSuppliersOfSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const supply = await Supply.findOne({ supplyID }).populate("suppliers");
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res.status(200).json({
      message: "Suppliers retrieved successfully",
      data: supply.suppliers,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Associates a supplier with a supply
 * @param req Express Request object containing supplyID in params and supplierID in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const addSupplierToSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const { supplierID } = req.body;
    const supply = await Supply.findOneAndUpdate(
      { supplyID },
      { $addToSet: { suppliers: supplierID } },
      { new: true }
    );
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Supplier added successfully", data: supply });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Removes a supplier association from a supply
 * @param req Express Request object containing supplyID and supplierID in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const removeSupplierFromSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID, supplierID } = req.params;
    const supply = await Supply.findOneAndUpdate(
      { supplyID },
      { $pull: { suppliers: supplierID } },
      { new: true }
    );
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Supplier removed successfully", data: supply });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// ----- Additional Endpoints for Nested Fields -----

/**
 * Adds pricing information for a supplier to a supply
 * @param req Express Request object containing supplyID in params and pricing details in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 400 if supplier pricing already exists
 * @throws 500 if server error occurs
 */
export const addSupplierPricing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const { supplier, price, priceValidity, unitQuantity, unitPrice } =
      req.body;
    const supply = await Supply.findOne({ supplyID });
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    // Avoid duplicate supplier pricing entries
    const exists = supply.supplierPricing.find(
      (pricing) => pricing.supplier.toString() === supplier
    );
    if (exists) {
      res
        .status(400)
        .json({ message: "Supplier pricing already exists for this supplier" });
      return;
    }
    supply.supplierPricing.push({
      supplier,
      price,
      priceValidity,
      unitQuantity,
      unitPrice,
    });
    await supply.save();
    res.status(200).json({
      message: "Supplier pricing added successfully",
      data: supply,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Updates pricing information for a supplier of a supply
 * @param req Express Request object containing supplyID in params and updated price in body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply or supplier pricing not found
 * @throws 500 if server error occurs
 */
export const updateSupplierPricing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const { supplier, price } = req.body;
    const supply = await Supply.findOne({ supplyID });
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    const pricingIndex = supply.supplierPricing.findIndex(
      (pricing) => pricing.supplier.toString() === supplier
    );
    if (pricingIndex === -1) {
      res.status(404).json({ message: "Supplier pricing not found" });
      return;
    }
    supply.supplierPricing[pricingIndex].price = price;
    await supply.save();
    res.status(200).json({
      message: "Supplier pricing updated successfully",
      data: supply,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Removes pricing information for a supplier from a supply
 * @param req Express Request object containing supplyID and supplier in params
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const removeSupplierPricing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID, supplier } = req.params;
    const supply = await Supply.findOneAndUpdate(
      { supplyID },
      { $pull: { supplierPricing: { supplier } } },
      { new: true }
    );
    if (!supply) {
      res.status(404).json({ message: "Supply not found" });
      return;
    }
    res.status(200).json({
      message: "Supplier pricing removed successfully",
      data: supply,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

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
