import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { supplyIDRegex } from "../constants/regex";
import { defaultSupplyStatus, supplyStatusEnums } from "../constants";
import { supplySchema } from "../validators/supplyValidator";

export interface ISpecification {
  specProperty: string;
  specValue: string | number; // Can be either a string or a number
}

export interface ISupplierPricing {
  supplier: Types.ObjectId;
  price: number;
  priceValidity: Date;
  unitQuantity: number; // e.g., 5 for 5kg
  unitPrice: number; // price per unit (e.g., price per 1kg)
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
  price: {
    type: Number,
    required: true,
  },
  priceValidity: {
    type: Date,
    required: true,
  },
  unitQuantity: {
    type: Number,
    required: true,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
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
      required: true,
      validate: {
        validator: function (pricing: ISupplierPricing[]) {
          const supplierIds = pricing.map((p) => p.supplier.toString());
          const uniqueSupplierIds = new Set(supplierIds);
          return supplierIds.length === uniqueSupplierIds.size;
        },
        message: "Duplicate suppliers found in supplier pricing",
      },
    },
    specifications: {
      type: [SpecificationSchema],
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

// Pre-save hook for various validation
SupplySchema.pre("save", async function (next) {
  try {
    // Zod validation pre-save hook
    const validationResult = supplySchema.safeParse(this.toObject());
    if (!validationResult.success) {
      return next(
        new Error(
          validationResult.error.errors.map((e) => e.message).join(", ")
        )
      );
    }
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

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
