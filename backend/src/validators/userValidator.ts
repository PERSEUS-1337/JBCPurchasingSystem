// /validators/userValidator.ts
import { z } from "zod";
import {
  roleList,
  statusList,
  defaultStatus,
  defaultRole,
} from "../constants";

export const userSchema = z
  .object({
    userID: z.string(),
    fullname: z.string().min(1, "Fullname is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(roleList).default(defaultRole), // Reused constant
    position: z.string().min(1, "Position is required"),
    department: z.string().min(1, "Department is required"),
    status: z.enum(statusList).default(defaultStatus), // Reused constant
  })
  .strict();

export type UserInput = z.infer<typeof userSchema>;


export const userUpdateSchema = z
  .object({
    fullname: z
      .string()
      .min(1, "Fullname cannot be empty") // Ensure fullname is not an empty string if provided
      .optional(), // fullname is optional but must be validated if included
    email: z
      .string()
      .email("Invalid email format") // Ensure the email format is valid if included
      .optional(), // email is optional but must be validated if provided
    position: z
      .string()
      .min(1, "Position cannot be empty") // Ensure position is not an empty string if provided
      .optional(), // position is optional but must be validated if included
    department: z
      .string()
      .min(1, "Department cannot be empty") // Ensure department is not an empty string if provided
      .optional(), // department is optional but must be validated if included
  })
  .strict(); // Disallow extra fields

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

// Schema for user profile view (general view)
export const userViewSchema = z
  .object({
    fullname: z.string(),
    email: z.string(),
    position: z.string(),
    department: z.string(),
    createdAt: z.coerce.date().optional(), // Converts ISO string to Date object
    updatedAt: z.coerce.date().optional(),
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
export type UserView = z.infer<typeof userViewSchema>;
export type UserAdminView = z.infer<typeof userAdminViewSchema>;


