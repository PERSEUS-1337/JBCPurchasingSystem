import { z, ZodIssueCode, RefinementCtx } from "zod";
import { Types } from "mongoose";
import { supplyIDRegex } from "../constants/regex";
import {
  defaultSupplyStatus,
  supplyRestrictedFields,
  supplyStatusEnums,
} from "../constants";

// Base Schema for Supply Inputs
const objectIdSchema = z.union([
  z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  }),
  z.instanceof(Types.ObjectId),
]);

const specificationSchema = z
  .object({
    specProperty: z
      .string()
      .trim()
      .min(1, "Specification property is required"),
    specValue: z.union([z.string(), z.number()]),
  })
  .refine(
    (spec) => spec.specProperty.length > 0 && spec.specValue !== undefined,
    {
      message: "Specification property and value are required",
    }
  );

const MAX_PRICE = 1e6; // Define a maximum price limit

export const supplierPricingSchema = z
  .object({
    supplier: objectIdSchema,
    price: z
      .number()
      .min(0, "Price must be non-negative")
      .max(MAX_PRICE, "Price exceeds maximum limit"),
    priceValidity: z
      .union([z.string(), z.date()])
      .transform((val) => (typeof val === "string" ? new Date(val) : val)),
    unitQuantity: z.number().min(1, "Unit quantity must be at least 1"),
    unitPrice: z
      .number()
      .min(0, "Unit price must be non-negative")
      .max(MAX_PRICE, "Unit price exceeds maximum limit"),
  })
  .refine((data) => data.price === data.unitPrice * data.unitQuantity, {
    message: "Price must equal unitPrice * unitQuantity",
  });

export const supplierPricingUpdateSchema = z
  .object({
    price: z
      .number()
      .min(0, "Price must be non-negative")
      .max(MAX_PRICE, "Price exceeds maximum limit"),
    priceValidity: z
      .union([z.string(), z.date()])
      .transform((val) => (typeof val === "string" ? new Date(val) : val)),
    unitQuantity: z.number().min(1, "Unit quantity must be at least 1"),
    unitPrice: z
      .number()
      .min(0, "Unit price must be non-negative")
      .max(MAX_PRICE, "Unit price exceeds maximum limit"),
  })
  .refine((data) => data.price === data.unitPrice * data.unitQuantity, {
    message: "Price must equal unitPrice * unitQuantity",
  });

// Base schema without refinements
const baseSupplySchema = z.object({
  supplyID: z
    .string()
    .trim()
    .min(1, "Supply ID is required")
    .regex(supplyIDRegex, "Supply ID must follow the correct format"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  description: z.string().trim().min(1, "Description is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  unitMeasure: z.string().trim().min(1, "Unit of measure is required"),
  supplierPricing: z
    .array(supplierPricingSchema)
    .min(1, "Supply must have at least one supplier with pricing"),
  specifications: z
    .array(specificationSchema)
    .min(1, "Specifications cannot be empty"),
  status: z.enum(supplyStatusEnums).default(defaultSupplyStatus),
  attachments: z.array(z.string()).default([]),
});

// Full schema - simplified by removing the problematic refinement
export const supplySchema = baseSupplySchema;

// Update schema with partial fields and additional validations
export const supplyUpdateSchema = baseSupplySchema
  .partial()
  .superRefine((data, ctx: RefinementCtx) => {
    // Check if the object is empty
    const isEmpty = Object.keys(data).length === 0;
    if (isEmpty) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        path: [],
        message: "At least one field must be updated.",
      });
    }

    // Check for restricted fields being updated
    for (const field of supplyRestrictedFields) {
      if (field in data) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          path: [field],
          message: `Update not allowed on restricted field: ${field}`,
        });
      }
    }
  });

export type SupplyInput = z.infer<typeof supplySchema>;
export type SpecificationInput = z.infer<typeof specificationSchema>;
export type SupplierPricingInput = z.infer<typeof supplierPricingSchema>;
export type SupplyUpdateInput = z.infer<typeof supplyUpdateSchema>;
