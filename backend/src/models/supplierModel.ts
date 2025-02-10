import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { contactNumberRegex, emailRegex, supplierIDRegex } from "../constants/regex";
import { defaultSupplierStatus, supplierStatusEnums } from "../constants";

export interface IContactPerson {
  name: string;
  contactNumber: string;
  email: string;
  position: string;
}

export interface ISupplier extends Document {
  supplierID: string;
  name: string;
  contactNumbers: string[];
  emails: string[];
  contactPersons: IContactPerson[];
  address: string;
  supplies: Types.ObjectId[];
  documentation: string[];
  primaryTag: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  status: string;
}

// Static Methods (Available, regardless of instance)
interface ISupplierModel extends Model<ISupplier> {
  checkDuplicateSupplier(supplierID: string): Promise<boolean>;
}


const ContactPersonSchema = new Schema<IContactPerson>(
  {
    name: { type: String, required: true },
    contactNumber: {
      type: String,
      required: true,
      validate: {
        validator: (num: string) => contactNumberRegex.test(num),
        message:
          "Phone number can only contain numbers and an optional '+' at the start",
      },
    },
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          return emailRegex.test(email);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    position: { type: String },
  },
  { timestamps: true }
);

const SupplierSchema = new Schema<ISupplier>(
  {
    supplierID: {
      type: String,
      required: true,
      unique: true,
      match: supplierIDRegex,
    },
    name: { type: String, required: true },
    contactNumbers: {
      type: [String],
      required: true,
      validate: {
        validator: (contactNumbers: string[]) =>
          contactNumbers.length > 0 &&
          contactNumbers.every((num) => contactNumberRegex.test(num)),
        message: "At least one valid company number is required",
      },
    },
    emails: [
      {
        type: String,
        lowercase: true,
        required: true,
        validate: {
          validator: function (email: string) {
            return emailRegex.test(email);
          },
          message: (props) => `${props.value} is not a valid email address`,
        },
      },
    ],
    contactPersons: {
      type: [ContactPersonSchema],
      default: [],
    },
    address: { type: String, required: true },
    supplies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Supply",
      default: [],
    },
    documentation: { type: [String], default: [] },
    primaryTag: { type: String, required: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (tags: string[]) => tags.length > 0,
        message: "At least one tag is required",
      },
    },
    status: {
      type: String,
      enum: supplierStatusEnums,
      default: defaultSupplierStatus,
    },
  },
  { timestamps: true }
);

// STATIC METHODS, regardless if User or Not
SupplierSchema.statics.checkDuplicateSupplier = async function (
  supplierID: string
): Promise<boolean> {
  const existingSupplier = await this.findOne({ supplierID });
  console.log(existingSupplier)
  return !!existingSupplier; // Convert the result to a boolean
};

const Supplier = mongoose.model<ISupplier, ISupplierModel>(
  "Supplier",
  SupplierSchema,
  "suppliers"
);

export default Supplier;
