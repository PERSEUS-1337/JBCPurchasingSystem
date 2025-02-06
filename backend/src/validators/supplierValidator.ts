import { z } from "zod";
import { defaultStatus, statusList } from "../constants";

export const contactPersonSchema = z.object({
  name: z.string().min(1, "Contact Person name is required"),
  number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(14, "Phone number must not exceed 14 digits")
    .regex(
      /^\+?\d{10,14}$/,
      "Phone number can only contain numbers and an optional '+' at the start"
    ),
  email: z.string().email("Invalid email format").optional(),
  position: z.string().optional(),
});

export const supplierSchema = z.object({
  supplierID: z
    .string()
    .min(1, "Supplier ID is required")
    .regex(/^SUP-\d+$/, "Supplier ID must follow the format 'SUP-XXX'"),
  name: z
    .string()
    .min(1, "Company Name is required")
    .max(100, "Company Name must not exceed 100 characters"),
  companyNumbers: z
    .array(
      z
        .string()
        .regex(
          /^\+?\d{10,14}$/,
          "Phone number can only contain numbers and an optional '+' at the start"
        )
    )
    .min(1, "At least one company number is required"),
  contactPersons: z.array(contactPersonSchema).optional(),
  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must not exceed 255 characters"),
  supplies: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid supply ID format"))
    .optional(),
  primaryTag: z.string().min(1, "Primary category tag is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  status: z.enum(statusList).default(defaultStatus),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
