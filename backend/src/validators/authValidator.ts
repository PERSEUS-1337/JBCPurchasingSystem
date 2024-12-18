import { z } from "zod";

// Schema for Change Password
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

// Schema for Reset Password
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .refine((val) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(val), {
      message:
        "Password must contain at least one letter, one number, and a special character",
    }),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
