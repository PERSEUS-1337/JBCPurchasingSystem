import { z } from "zod";
import { roleList, statusList } from "../constants";

// Schema for user profile view (general view)
export const userProfileViewSchema = z
  .object({
    username: z.string(),
    fullname: z.string(),
    email: z.string(),
    position: z.string(),
    department: z.string(),
    dateCreated: z
    .union([z.date(), z.string().transform((val) => new Date(val))])
    .refine((val) => val instanceof Date && !isNaN(val.getTime()), {
      message: "Invalid date format",
    }),
    status: z.enum(statusList),
  })
  .strict();
  
  // Schema for admin view with extended fields
  export const userProfileAdminViewSchema = userProfileViewSchema
  .extend({
    userID: z.string(),
    role: z.enum(roleList),
    idNumber: z.string().min(1, "ID Number is required"),
  })
  .strict();

// Types for the schemas
// export type UserProfileView = z.infer<typeof userProfileViewSchema>;
// export type UserProfileAdminView = z.infer<typeof userProfileAdminViewSchema>;
