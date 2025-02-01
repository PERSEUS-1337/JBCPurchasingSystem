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
    idNumber: z.string().min(1, "ID Number is required"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(roleList).default(defaultRole), // Reused constant
    position: z.string().min(1, "Position is required"),
    department: z.string().min(1, "Department is required"),
    dateCreated: z.date().optional(),
    status: z.enum(statusList).default(defaultStatus), // Reused constant
  })
  .strict();

export type UserInput = z.infer<typeof userSchema>;
