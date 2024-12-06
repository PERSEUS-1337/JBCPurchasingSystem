import { Request, Response } from "express";
import { z } from "zod";
import User from "../models/userModel";
import { userSchema, UserInput } from "../middlewares/userValidator";
import { LoginInput, loginSchema } from "../middlewares/loginValidator";

// TODO: for testing only, will be moved to a centralized file later
const regSuccessMsg = "User registered successfully";
const userExistsMsg = "Username already exists";
const usernameRequiredMsg = "Username is required";
const passwordRequiredMsg = "Password is required";
const usernameShortMsg = "Username must be at least 3 characters long";
const passwordShortMsg = "Password must be at least 8 characters long";
const invalidRequestMsg = "Invalid request payload";
const loginSuccessMsg = "Login successful";

const mockToken = "mock-jwt-token";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate using Zod (strict mode will reject unexpected fields)
    const userInput: UserInput = userSchema.parse(req.body);

    const user = new User(userInput);
    await user.save();

    res.status(201).json({
      message: regSuccessMsg,
      username: user.username,
    });

    return;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      // Handle validation errors
      res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    } else if (err.code === 11000) {
      // Handle duplicate key error
      res.status(409).json({ message: userExistsMsg });
    } else {
      // Log and handle unexpected errors
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Controller for logging in a user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body using Zod
    const userInput: LoginInput = loginSchema.parse(req.body); // This will throw if validation fails

    const { email, password } = userInput;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User does not exist." });
      return;
    }

    // If user exists, compare passwords
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    // On successful login, return response
    res.status(200).json({
      message: "Login successful",
      token: "mock-jwt-token", // Mock token (replace with actual JWT logic)
    });

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      // Handle validation errors
      res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    } else {
      // Handle other errors (user not found, password mismatch, etc.)
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Controller for logging out a user
export const logout = (req: Request, res: Response): void => {
  res.status(200).send({ message: "Logout successful" });
};

// Controller for refreshing tokens
export const refresh = (req: Request, res: Response): void => {
  res.status(200).send({
    message: "Token refreshed",
    token: "new-mock-jwt-token",
  });
};
