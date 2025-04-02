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

const MAX_PRICE = 1e6; // Define a maximum price limit

const SupplierPricingSchema = new Schema<ISupplierPricing>({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: MAX_PRICE, // Add max validation
  },
  priceValidity: {
    type: Date,
    required: true,
  },
  unitQuantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
    max: MAX_PRICE, // Add max validation
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
      default: [],
      required: true,
      validate: {
        validator: function (pricing: ISupplierPricing[]) {
          return pricing.length > 0;
        },
        message: "Supply must have at least one supplier with pricing",
      },
    },
    specifications: {
      type: [SpecificationSchema],
      default: [],
      required: true,
      validate: {
        validator: function (specs: ISpecification[]) {
          return specs.length > 0; // Ensure specifications are not empty
        },
        message: "Specifications cannot be empty",
      },
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

// Pre-save hook for validation
SupplySchema.pre("save", async function (next) {
  try {
    // 1. Validate specifications are unique
    const specProperties = new Set();
    for (const spec of this.specifications) {
      if (specProperties.has(spec.specProperty)) {
        throw new Error("Duplicate specification property found");
      }
      specProperties.add(spec.specProperty);
    }

    // 2. Validate suppliers exist in database
    const Supplier = mongoose.model("Supplier");
    const supplierIds = this.suppliers.map((s) => s.toString());
    const existingSuppliers = await Supplier.find({
      _id: { $in: supplierIds },
    });

    if (existingSuppliers.length !== supplierIds.length) {
      throw new Error("One or more suppliers do not exist in the database");
    }

    // 3. Validate no duplicate suppliers in pricing
    const pricingSuppliers = new Set();
    for (const pricing of this.supplierPricing) {
      if (pricingSuppliers.has(pricing.supplier.toString())) {
        throw new Error("Duplicate supplier pricing found");
      }
      pricingSuppliers.add(pricing.supplier.toString());
    }

    // 4. Validate all suppliers in pricing exist in suppliers array
    const hasAllSuppliers = Array.from(pricingSuppliers).every((supplierId) =>
      supplierIds.includes(supplierId as string)
    );

    if (!hasAllSuppliers) {
      throw new Error("All suppliers in pricing must exist in suppliers array");
    }

    // 5. Validate unitPrice calculation
    for (const pricing of this.supplierPricing) {
      if (pricing.price !== pricing.unitPrice * pricing.unitQuantity) {
        throw new Error("Price must equal unitPrice * unitQuantity");
      }
    }

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error("An unknown error occurred during validation"));
    }
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
