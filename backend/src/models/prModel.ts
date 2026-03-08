import mongoose, { Document, Model, Schema } from "mongoose";

const prStatusEnums = [
  "Draft",
  "Recommended",
  "Submitted",
  "Approved",
  "Rejected",
  "Cancelled",
];

export interface IPurchaseRequest extends Document {
  prID: string;
  projCode: string;
  projName: string;
  projClient: string;
  dateRequested: Date;
  dateRequired: Date;
  requestedBy: string;
  recommendedBy?: string;
  approvedBy?: string;
  prStatus: string;
  itemsRequested: mongoose.Types.ObjectId[];
  totalCost: number;
  justification?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  changelog: {
    timestamp: Date;
    changedBy: string;
    changeType: "status" | "edit" | "item";
    previousValue?: any;
    newValue?: any;
    description: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface IPurchaseRequestModel extends Model<IPurchaseRequest> {
  checkDuplicatePR(prID: string): Promise<boolean>;
}

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
    recommendedBy: { type: String, required: false },
    approvedBy: { type: String, required: false },
    prStatus: { type: String, required: true, enum: prStatusEnums },
    itemsRequested: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "PRItem",
      required: true,
    },
    totalCost: { type: Number, required: true },
    justification: { type: String },
    rejectionReason: { type: String },
    cancellationReason: { type: String },
    changelog: {
      type: [
        {
          timestamp: { type: Date, default: Date.now },
          changedBy: { type: String, required: true },
          changeType: {
            type: String,
            enum: ["status", "edit", "item"],
            required: true,
          },
          previousValue: { type: Schema.Types.Mixed },
          newValue: { type: Schema.Types.Mixed },
          description: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

/**
 * Static method to check for duplicate purchase request by prID.
 */
PurchaseRequestSchema.statics.checkDuplicatePR = async function (
  prID: string,
): Promise<boolean> {
  const exists = await this.exists({ prID });
  return !!exists;
};

/**
 * Pre-save hook to ensure that the purchase request is recommended before it can be approved.
 */
PurchaseRequestSchema.pre("save", function (next) {
  if (this.prStatus === "Approved" && this.recommendedBy === undefined) {
    return next(
      new Error(
        "Purchase request must be recommended before it can be approved.",
      ),
    );
  }

  if (
    (this.prStatus === "Recommended" &&
      (!this.itemsRequested || this.itemsRequested.length === 0)) ||
    (this.prStatus !== "Draft" &&
      this.prStatus !== "Recommended" &&
      (!this.itemsRequested || this.itemsRequested.length === 0))
  ) {
    return next(
      new Error(
        "Purchase request must have itemsRequested before it can be submitted for approval",
      ),
    );
  }

  next();
});

const PurchaseRequest = mongoose.model<IPurchaseRequest, IPurchaseRequestModel>(
  "PurchaseRequest",
  PurchaseRequestSchema,
  "purchase_requests",
);

export default PurchaseRequest;
