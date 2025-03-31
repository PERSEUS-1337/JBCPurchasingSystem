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
  categories: string[];
  unitMeasure: string;
  suppliers: Types.ObjectId[];
  supplierPricing: ISupplierPricing[];
  specifications: ISpecification[];
  status: string;
  attachments: string[];
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
    categories: { type: [String], required: true },
    unitMeasure: { type: String, required: true },
    suppliers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
      },
    ],
    supplierPricing: {
      type: [SupplierPricingSchema],
      default: [],
      required: true,
    },
    specifications: {
      type: [SpecificationSchema],
      default: [],
      required: true,
    },
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
  // Using exists for performance, as it only returns a boolean result
  const exists = await this.exists({ supplyID });
  return !!exists;
};

const Supply = mongoose.model<ISupply, ISupplyModel>(
  "Supply",
  SupplySchema,
  "supplies"
);

export default Supply;
