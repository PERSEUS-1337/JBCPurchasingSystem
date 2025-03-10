import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { supplyIDRegex } from "../constants/regex";
import { defaultSupplyStatus, supplyStatusEnums } from "../constants";

export interface ISpecification {
  specProperty: string;
  specValue: string | number; // Can be either a string or a number
}

export interface ISupplierPricing {
  supplier: Types.ObjectId;
  price: number;
}

export interface ISupply extends Document {
  supplyID: string;
  name: string;
  description: string;
  categories: string[]; // Updated to be an array
  unitMeasure: string; // Renamed for consistency
  suppliers: Types.ObjectId[]; // List of supplier references
  supplierPricing: ISupplierPricing[]; // List of supplier-price pairs
  specifications: ISpecification[];
  status: string;
  attachments: string[]; // Store file paths or URLs
  createdAt: Date;
  updatedAt: Date;
}

// Static Methods (Available regardless of instance)
interface ISupplyModel extends Model<ISupply> {
  checkDuplicateSupply(supplyID: string): Promise<boolean>;
}

const SupplierPricingSchema = new Schema<ISupplierPricing>({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
});

const SpecificationSchema = new Schema<ISpecification>({
  specProperty: { type: String, required: true },
  specValue: { type: Schema.Types.Mixed, required: true }, // Can be string or number
});

const SupplySchema = new Schema<ISupply>(
  {
    supplyID: {
      type: String,
      required: true,
      unique: true,
      match: supplyIDRegex,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    categories: { type: [String], required: true }, // Changed to an array
    unitMeasure: { type: String, required: true },
    suppliers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Supplier",
      required: true,
    },
    supplierPricing: { type: [SupplierPricingSchema], default: [] },
    specifications: { type: [SpecificationSchema], default: [] }, // Added field
    status: {
      type: String,
      enum: supplyStatusEnums,
      default: defaultSupplyStatus,
    },
    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

// STATIC METHODS
SupplySchema.statics.checkDuplicateSupply = async function (
  supplyID: string
): Promise<boolean> {
  const existingSupply = await this.findOne({ supplyID });
  return !!existingSupply;
};

const Supply = mongoose.model<ISupply, ISupplyModel>(
  "Supply",
  SupplySchema,
  "supplies"
);

export default Supply;
