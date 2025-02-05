const mongoose = require("mongoose");

import { Document, Types } from "mongoose";

export interface ISupplier extends Document {
  supplierID: string;
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  lastOrderDate?: Date;
  supplies: Types.ObjectId[];
  documentation: any[];
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new mongoose.Schema(
  {
    supplierID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contactPerson: { type: String },
    contactNumber: { type: String },
    email: { type: String },
    address: { type: String },
    lastOrderDate: { type: Date },
    supplies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supply" }],
    documentation: { type: Array }, // Or you can use a more specific type if needed
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", SupplierSchema);
