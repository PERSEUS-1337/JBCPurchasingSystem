import { Request, Response } from "express";
import Supply, { ISupply } from "../models/supplyModel";
import { SupplyInput } from "../validators/supplyValidator";

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

export const searchSupplies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;

    // Check if query is missing
    if (!query) {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    // Search supplies in the database
    const supplies = await Supply.find({
      name: { $regex: query, $options: "i" },
    });

    // Check if no supplies were found
    if (supplies.length === 0) {
      res.status(404).json({ message: "No supplies matched your search" });
      return;
    }

    // Return the found supplies
    res.status(200).json({ message: "Supplies retrieved", data: supplies });
  } catch (err: any) {
    // Handle internal server errors
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

export const getAllSupplies = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const supplies = await Supply.find({}, { _id: 0, __v: 0 });

    if (supplies.length === 0) {
      res.status(404).json({ message: "No supplies found", data: [] });
      return;
    }

    res
      .status(200)
      .json({ message: "Supplies retrieved successfully", data: supplies });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export const createSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newSupplyData: SupplyInput = req.body;
    const isDuplicate = await Supply.findOne({
      supplyID: newSupplyData.supplyID,
    });

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

export const updateSupply = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const updates = req.body;

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
      { new: true }
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
