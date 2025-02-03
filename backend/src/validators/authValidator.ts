import { register } from "module";
import { z } from "zod";
import { defaultRole, defaultStatus, roleList, statusList } from "../constants";

export const registerSchema = z
  .object({
    userID: z.string(),
    fullname: z.string().min(1, "Fullname is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(roleList).default(defaultRole), // Reused constant
    position: z.string().min(1, "Position is required"),
    department: z.string().min(1, "Department is required"),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine((val) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(val), {
      message:
        "Password must contain at least one letter, one number, and a special character",
    }),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Forgot Password Schema (optional, if needed)
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
