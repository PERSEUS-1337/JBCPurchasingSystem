import { z, ZodIssueCode, RefinementCtx } from "zod";
import { Types } from "mongoose";

// Restricted fields for update
const prItemRestrictedFields = [
  "prItemID",
  "prID",
  "createdAt",
  "updatedAt",
] as const;

// PR Item Schema (from prItemModel.ts)
export const prItemSchema = z.object({
  prItemID: z.string().trim().min(1, "PR Item ID is required"),
  prID: z.string().trim().min(1, "PR ID is required"),
  supplyID: z.string().trim().min(1, "Supply ID is required"),
  supplierID: z.string().trim().min(1, "Supplier ID is required"),
  itemDescription: z.string().trim().min(1, "Item description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitOfMeasurement: z
    .string()
    .trim()
    .min(1, "Unit of measurement is required"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  totalPrice: z.number().min(0, "Total price must be non-negative").optional(),
  deliveryAddress: z.string().trim().min(1, "Delivery address is required"),
});

// Update schema with partial fields and additional validations
export const prItemUpdateSchema = z
  .record(z.any()) // Accept any object first
  .superRefine((data, ctx: RefinementCtx) => {
    // Check if the object is empty
    const isEmpty = Object.keys(data).length === 0;
    if (isEmpty) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        path: [],
        message: "At least one field must be updated.",
      });
      return;
    }

    // Check for restricted fields being updated first
    for (const field of prItemRestrictedFields) {
      if (field in data) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          path: [field],
          message: `Update not allowed on restricted field: ${field}`,
        });
      }
    }

    // Now validate allowed fields using the partial schema
    const allowedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (!prItemRestrictedFields.includes(key as any)) {
        allowedData[key] = value;
      }
    }

    // Validate the allowed fields against the partial schema
    const partialValidation = prItemSchema.partial().safeParse(allowedData);
    if (!partialValidation.success) {
      partialValidation.error.issues.forEach((issue) => {
        ctx.addIssue(issue);
      });
    }
  });

export const prItemBulkReplaceSchema = z.object({
  items: z.array(prItemSchema).min(1, "At least one item is required"),
});

export type PRItemInput = z.infer<typeof prItemSchema>;
export type PRItemUpdateInput = z.infer<typeof prItemUpdateSchema>;
export type PRItemBulkReplaceInput = z.infer<typeof prItemBulkReplaceSchema>;
