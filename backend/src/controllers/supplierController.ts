import { Request, Response } from "express";
import Supplier, { ISupplier } from "../models/supplierModel";
import { SupplierInput } from "../validators/supplierValidator";

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

    res.status(200).json({
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

    if (suppliers.length === 0) {
      res.status(404).json({ message: "No suppliers found", data: [] });
      return;
    }

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

    if (!query || typeof query !== "string") {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    // Convert the query into individual words for flexible searching
    const keywords = query.trim().split(/\s+/);

    // Create an array of regex conditions for flexible search
    const searchConditions = keywords.map((word) => ({
      $or: [
        { name: { $regex: word, $options: "i" } }, // Search by name
        { primaryTag: { $regex: word, $options: "i" } }, // Search by primary tag
        { tags: { $regex: word, $options: "i" } }, // Search in tags array
        { emails: { $regex: word, $options: "i" } }, // Search in emails array
        { contactNumbers: { $regex: word, $options: "i" } }, // Search in contact numbers
        { "contactPersons.name": { $regex: word, $options: "i" } }, // Search contact person names
      ],
    }));

    const suppliers = await Supplier.find({ $and: searchConditions });

    if (suppliers.length === 0) {
      res
        .status(404)
        .json({ message: "No suppliers matched your search", data: [] });
      return;
    }

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
    const newSupplierData: SupplierInput = req.body;
    // Check if supplier with the same supplierID already exists
    const isDuplicate = await Supplier.checkDuplicateSupplier(
      newSupplierData.supplierID
    );

    if (isDuplicate) {
      res.status(400).json({
        message: "Supplier ID already exists",
        data: null,
      });
      return;
    }

    // Create and save the new supplier
    const newSupplier: ISupplier = new Supplier(newSupplierData);
    await newSupplier.save();

    res.status(201).json({
      message: "Supplier created successfully",
      data: newSupplier,
      createdAt: newSupplier.createdAt,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// TODO: General update supplier
export const updateSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierID } = req.params;
    const updates = req.body;

    // Reject empty updates
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No valid update data provided" });
      return;
    }

    // Find supplier by supplierID first
    const supplier = await Supplier.findOne({ supplierID }).lean();

    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }

    // Perform the update
    await Supplier.updateOne({ supplierID }, updates, { runValidators: true });

    // Fetch the updated supplier as a lean object
    const updatedSupplier = await Supplier.findOne({ supplierID }).lean();

    if (!updatedSupplier) {
      res.status(404).json({ message: "Supplier not found after update" });
      return;
    }

    res.status(200).json({
      message: "Supplier updated successfully",
      data: updatedSupplier,
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

export const addContactNumber = async (): Promise<void> => {};
export const removeContactNumber = async (): Promise<void> => {};
export const addEmail = async (): Promise<void> => {};
export const removeEmail = async (): Promise<void> => {};
export const addContactPerson = async (): Promise<void> => {};
export const updateContactPerson = async (): Promise<void> => {};
export const removeContactPerson = async (): Promise<void> => {};
export const addSupply = async (): Promise<void> => {};
export const removeSupply = async (): Promise<void> => {};
export const addDocs = async (): Promise<void> => {};
export const removeDocs = async (): Promise<void> => {};

// export const updateSupplierStatus = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const supplier = await Supplier.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!supplier) {
//       res.status(404).json({ message: "Supplier not found" });
//       return;
//     }

//     res.status(200).json({
//       message: "Supplier status updated successfully",
//       data: supplier,
//     });
//   } catch (err: any) {
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: err.message });
//   }
// };
