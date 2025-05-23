import mongoose, { Document, Model, Schema } from "mongoose";

const prStatusEnums = [
  "Draft",
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
  approvedBy: string;
  prStatus: string;
  itemsRequested?: mongoose.Types.ObjectId[];
  totalCost: number;
  justification?: string;
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
    recommendedBy: { type: String },
    approvedBy: { type: String, required: true },
    prStatus: { type: String, required: true, enum: prStatusEnums },
    itemsRequested: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "PRItem",
    },
    totalCost: { type: Number, required: true },
    justification: { type: String },
    // logs: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

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
