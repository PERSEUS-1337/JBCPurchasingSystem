import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPRItem extends Document {
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
    totalPrice: { type: Number, required: false },
    deliveryAddress: { type: String, required: true },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Pre-save hook to calculate totalPrice based on quantity and unitPrice
PRItemSchema.pre<IPRItem>("save", function (next) {
  this.totalPrice = this.quantity * this.unitPrice; // Calculate totalPrice
  next();
});

// Static method to check for duplicate prItemID
PRItemSchema.statics.checkDuplicatePRItem = async function (
  prItemID: string
): Promise<boolean> {
  const exists = await this.exists({ prItemID });
  return !!exists;
};

// Create the model
const PRItem = mongoose.model<IPRItem>("PRItem", PRItemSchema, "pr_items");

export default PRItem;
