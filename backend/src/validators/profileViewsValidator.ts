import { z } from "zod";
import { roleList, statusList } from "../constants";

// Schema for user profile view (general view)
export const userViewSchema = z
  .object({
    fullname: z.string(),
    email: z.string(),
    position: z.string(),
    department: z.string(),
    dateCreated: z
      .union([z.date(), z.string().transform((val) => new Date(val))])
      .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
        message: "Invalid date format",
      }),
  })
  .strict();

// Schema for admin view with extended fields
export const userAdminViewSchema = userViewSchema
  .extend({
    userID: z.string(),
    role: z.enum(roleList),
    status: z.enum(statusList),
  })
  .strict();

// Types for the schemas
export type UserProfileView = z.infer<typeof userViewSchema>;
export type UserProfileAdminView = z.infer<typeof userAdminViewSchema>;
