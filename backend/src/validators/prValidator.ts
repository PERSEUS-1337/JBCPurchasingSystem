import { z, ZodIssueCode, RefinementCtx } from "zod";
import { Types } from "mongoose";

// PR status enums (from prModel.ts)
const prStatusEnums = [
  "Draft",
  "Recommended",
  "Submitted",
  "Approved",
  "Rejected",
  "Cancelled",
] as const;

// Restricted fields for update
const prRestrictedFields = [
  "prID",
  "createdAt",
  "updatedAt",
  "itemsRequested", // Items should be updated via a dedicated API
] as const;

// ObjectId validation
const objectIdSchema = z.union([
  z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  }),
  z.instanceof(Types.ObjectId),
]);

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

// Date validation schema with proper validation
const dateSchema = z
  .union([z.string(), z.date()])
  .refine(
    (val) => {
      const date = typeof val === "string" ? new Date(val) : val;
      return !isNaN(date.getTime());
    },
    {
      message: "Invalid date format",
    },
  )
  .transform((val) => (typeof val === "string" ? new Date(val) : val));

// Base PR Schema
const basePRSchema = z.object({
  prID: z.string().trim().min(1, "PR ID is required"),
  projCode: z.string().trim().min(1, "Project code is required"),
  projName: z.string().trim().min(1, "Project name is required"),
  projClient: z.string().trim().min(1, "Project client is required"),
  dateRequested: dateSchema.optional(),
  dateRequired: dateSchema,
  requestedBy: z.string().trim().min(1, "Requested by is required"),
  recommendedBy: z.string().trim().optional(),
  approvedBy: z.string().trim().optional(),
  prStatus: z.enum(prStatusEnums),
  itemsRequested: z.array(objectIdSchema).optional(),
  totalCost: z.number().min(0, "Total cost must be non-negative"),
  justification: z.string().trim().optional(),
  rejectionReason: z.string().trim().optional(),
  cancellationReason: z.string().trim().optional(),
});

// Full PR schema
export const prSchema = basePRSchema;

// Update schema with partial fields and additional validations
export const prUpdateSchema = z
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
    for (const field of prRestrictedFields) {
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
      if (!prRestrictedFields.includes(key as any)) {
        allowedData[key] = value;
      }
    }

    // Validate the allowed fields against the partial schema
    const partialValidation = basePRSchema.partial().safeParse(allowedData);
    if (!partialValidation.success) {
      partialValidation.error.issues.forEach((issue) => {
        ctx.addIssue(issue);
      });
    }
  });

export type PRInput = z.infer<typeof prSchema>;
export type PRItemInput = z.infer<typeof prItemSchema>;
export type PRUpdateInput = z.infer<typeof prUpdateSchema>;
