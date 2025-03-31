import { Request, Response } from "express";
import Supply, { ISupply } from "../models/supplyModel";
import { SupplyInput } from "../validators/supplyValidator";

// Get supply by supplyID
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

// Search supplies by name (case-insensitive)
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

// Get all supplies (exclude _id and __v)
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

// Create a new supply (using the model's static method to check for duplicates)
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

// Update supply (prevent updating immutable fields like supplyID)
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

// Delete a supply
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

// Update only the status of a supply
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

// Get suppliers of a supply with population
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

// Add a supplier to a supply
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

// Remove a supplier from a supply
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

// Manage supplierPricing
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

// Manage specifications
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

// Manage attachments
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
