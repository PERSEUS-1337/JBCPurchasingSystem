import { z } from "zod";

export const userSchema = z.object({
  userID: z.string(), // Will usually be auto-generated, but include it if required
  fullname: z.string().min(1, "Fullname is required"),
  idNumber: z.string().min(1, "ID Number is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.string().min(1, "Role is required"),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  dateCreated: z.date().optional(), // Typically auto-set
  status: z.enum(["Active", "Inactive"]).default("Active"),
}).strict(); // This rejects unexpected fields

export type UserInput = z.infer<typeof userSchema>;
