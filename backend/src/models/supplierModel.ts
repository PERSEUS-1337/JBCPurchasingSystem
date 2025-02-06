import mongoose, { Document, Schema, Types } from "mongoose";

export interface IContactPerson {
  name: string;
  number: string;
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
  lastOrderDate: Date;
  supplies: Types.ObjectId[];
  documentation: string[];
  primaryTag: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ContactPersonSchema = new Schema<IContactPerson>(
  {
    name: { type: String, required: true },
    number: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // Regular expression to validate email format
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
    supplierID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contactNumbers: {
      type: [String],
      required: true,
      validate: {
        validator: (contactNumbers: string[]) => contactNumbers.length > 0,
        message: "At least one contact number is required",
      },
    },
    emails: [
      {
        type: String,
        lowercase: true,
        required: true,
        validate: {
          validator: function (email: string) {
            // Regular expression to validate email format
            const emailRegex =
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
    lastOrderDate: { type: Date, default: null },
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
  },
  { timestamps: true }
);

const Supplier = mongoose.model<ISupplier>(
  "Supplier",
  SupplierSchema,
  "suppliers"
);

export default Supplier;
