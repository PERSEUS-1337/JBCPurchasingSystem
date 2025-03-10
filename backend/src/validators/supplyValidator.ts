import { z, ZodIssueCode } from "zod";
import { Types } from "mongoose";
import { supplyIDRegex } from "../constants/regex";
import { defaultSupplyStatus, supplyRestrictedFields, supplyStatusEnums } from "../constants";

// Base Schema for Supply Inputs
const objectIdSchema = z.union([
  z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  }),
  z.instanceof(Types.ObjectId),
]);

const specificationSchema = z.object({
  specProperty: z.string().min(1, "Specification property is required"),
  specValue: z
    .union([z.string(), z.number()])
    .refine((val) => val !== undefined, {
      message: "Specification value is required",
    }),
});

const supplierPricingSchema = z.object({
  supplier: objectIdSchema,
  price: z.number().min(0, "Price must be a positive number"),
});

export const supplySchema = z.object({
  supplyID: z
    .string()
    .min(1, "Supply ID is required")
    .regex(supplyIDRegex, "Supply ID must follow the correct format"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  description: z.string().min(1, "Description is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  unitMeasure: z.string().min(1, "Unit of measure is required"),
  suppliers: z
    .array(objectIdSchema)
    .min(1, "At least one supplier is required"),
  supplierPricing: z.array(supplierPricingSchema).default([]),
  specifications: z.array(specificationSchema).default([]),
  status: z.enum(supplyStatusEnums).default(defaultSupplyStatus),
  attachments: z.array(z.string()).default([]),
});

export const supplyUpdateSchema = supplySchema
  .partial()
  .superRefine((data: any, ctx) => {
    for (const field of supplyRestrictedFields) {
      if (data[field] !== undefined) {
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
