import mongoose, { Document, Model, Schema } from "mongoose";

const prStatusEnums = [
  "Draft",
  "Submitted",
  "Approved",
  "Rejected",
  "Cancelled",
];

export interface IPRItem {
  prItemID: string;
  prID: string;
  supplyID: string;
  supplierID: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasurement: string;
  unitPrice: number;
  totalPrice: number;
  deliveryAddress: string;
}

export interface IPurchaseRequest extends Document {
  prID: string;
  projCode: string;
  projName: string;
  projClient: string;
  dateRequested: Date;
  dateRequired: Date;
  requestedBy: string;
  recommendedBy?: string;
  approvedBy: string;
  prStatus: string;
  itemsRequested: IPRItem[];
  totalCost: number;
  justification?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IPurchaseRequestModel extends Model<IPurchaseRequest> {
  checkDuplicatePR(prID: string): Promise<boolean>;
}

const PRItemSchema = new Schema<IPRItem>(
  {
    prItemID: { type: String, required: true, unique: true },
    prID: { type: String, required: true },
    supplyID: { type: String, required: true },
    supplierID: { type: String, required: true },
    itemDescription: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitOfMeasurement: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Schema for the Purchase Request
 */
const PurchaseRequestSchema = new Schema<IPurchaseRequest>(
  {
    prID: { type: String, required: true, unique: true },
    projCode: { type: String, required: true },
    projName: { type: String, required: true },
    projClient: { type: String, required: true },
    dateRequested: { type: Date, default: Date.now },
    dateRequired: { type: Date, required: true },
    requestedBy: { type: String, required: true },
    recommendedBy: { type: String },
    approvedBy: { type: String, required: true },
    prStatus: { type: String, required: true, enum: prStatusEnums },
    itemsRequested: {
      type: [PRItemSchema],
      required: true,
      validate: {
        validator: (items: IPRItem[]): boolean => !!items && items.length > 0,
        message: "Purchase request must contain at least one item.",
      },
    },
    totalCost: { type: Number, required: true },
    justification: { type: String },
    // logs: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

/**
 * Pre-save hook to perform validations and calculations before saving.
 * 1. Checks for duplicate prItemID within itemsRequested.
 * 2. Recalculates the totalCost from the PR items.
 */
PurchaseRequestSchema.pre<IPurchaseRequest>("save", function (next) {
  if (this.itemsRequested && this.itemsRequested.length > 0) {
    // 1. Check for duplicate prItemIDs
    const itemIDs = new Set<string>();
    for (const item of this.itemsRequested) {
      if (itemIDs.has(item.prItemID)) {
        // If a duplicate is found, stop and return an error
        return next(new Error(`Duplicate prItemID found: ${item.prItemID}`));
      }
      itemIDs.add(item.prItemID);
    }

    // 2. Recalculate totalCost (only if no duplicates were found)
    this.totalCost = this.itemsRequested.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
  } else {
    // Ensure totalCost is 0 if there are no items
    this.totalCost = 0;
  }

  // Proceed to save if all checks pass
  next();
});

/**
 * Static method to check for duplicate purchase request by prID.
 */
PurchaseRequestSchema.statics.checkDuplicatePR = async function (
  prID: string
): Promise<boolean> {
  const exists = await this.exists({ prID });
  return !!exists;
};

const PurchaseRequest = mongoose.model<IPurchaseRequest, IPurchaseRequestModel>(
  "PurchaseRequest",
  PurchaseRequestSchema,
  "purchase_requests"
);

export default PurchaseRequest;
