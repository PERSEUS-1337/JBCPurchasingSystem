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

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
