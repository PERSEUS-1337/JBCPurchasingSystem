import { z } from "zod";

// Login Schema
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
