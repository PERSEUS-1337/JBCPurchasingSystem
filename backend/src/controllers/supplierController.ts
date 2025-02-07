import { Request, Response } from "express";
import Supplier from "../models/supplierModel";

export const getSupplierByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierID } = req.params;
    const supplier = await Supplier.findOne({ supplierID });

    if (!supplier) {
      res.status(404).json({ message: "Supplier not found", data: null });
      return;
    }

    res
      .status(200)
      .json({
        message: "Supplier details retrieved successfully",
        data: supplier,
      });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export const getAllSuppliers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const suppliers = await Supplier.find({}, { _id: 0, __v: 0 });
    res
      .status(200)
      .json({ message: "Suppliers retrieved successfully", data: suppliers });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export const searchSuppliers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;
    const suppliers = await Supplier.find({
      name: { $regex: query as string, $options: "i" },
    });

    res
      .status(200)
      .json({ message: "Search results retrieved", data: suppliers });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export const createSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res
      .status(201)
      .json({ message: "Supplier created successfully", data: supplier });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export const updateSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierID } = req.params;
    const updates = req.body;
    const supplier = await Supplier.findOneAndUpdate({ supplierID }, updates, {
      new: true,
    });

    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Supplier updated successfully", data: supplier });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export const updateSupplierStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }

    res
      .status(200)
      .json({
        message: "Supplier status updated successfully",
        data: supplier,
      });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export const deleteSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierID } = req.params;
    const supplier = await Supplier.findOneAndDelete({ supplierID });

    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Supplier deleted successfully", data: supplier });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
