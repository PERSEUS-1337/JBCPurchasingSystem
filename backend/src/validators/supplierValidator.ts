import { z } from "zod";
import { defaultSupplierStatus, supplierStatusEnums } from "../constants";
import { Types } from "mongoose";
import { contactNumberRegex, supplierIDRegex } from "../constants/regex";

export const contactPersonSchema = z.object({
  name: z.string().min(1, "Contact Person name is required"),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .max(14, "Contact number must not exceed 14 digits")
    .regex(
      contactNumberRegex,
      "Contact number can only contain numbers and an optional '+' at the start"
    ),
  email: z.string().email("Invalid email format").optional(),
  position: z.string().optional(),
});

export type contactPersonInput = z.infer<typeof contactPersonSchema>;

export const supplierSchema = z.object({
  supplierID: z
    .string()
    .min(1, "Supplier ID is required")
    .regex(supplierIDRegex, "Supplier ID must follow the format 'SUP-XXX'"),
  name: z
    .string()
    .min(1, "Company Name is required")
    .max(100, "Company Name must not exceed 100 characters"),
  contactNumbers: z
    .array(
      z
        .string()
        .regex(
          contactNumberRegex,
          "Contact number can only contain numbers and an optional '+' at the start"
        )
    )
    .min(1, "At least one company number is required"),
  emails: z.array(z.string().email("Invalid email format")).optional(),
  contactPersons: z.array(contactPersonSchema).default([]),
  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must not exceed 255 characters"),
  supplies: z.array(z.instanceof(Types.ObjectId)).optional(),
  primaryTag: z.string().min(1, "Primary category tag is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  documentation: z.array(z.string()).default([]),
  status: z
    .enum(supplierStatusEnums)
    .default(defaultSupplierStatus),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

export const supplierUpdateSchema = supplierSchema
  .omit({ supplierID: true, status: true, supplies: true }) // Exclude fields from being updated
  .partial();

export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>;
