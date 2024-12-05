import { Request, Response } from "express";
import User from "../models/userModel";

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

// Controller for registering a user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dynamically get allowed fields from the schema
    const allowedFields = Object.keys(User.schema.paths);
    const unexpectedFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      res.status(400).json({
        message: "Invalid request payload",
      });
      return;
    }
    console.log(req.body);

    const user = new User(req.body);
    await user.save();

    res.status(201).json({
      message: regSuccessMsg,
      token: mockToken,
      username: user.username,
    });

    return; //
  } catch (err: any) {
    // Handle password length validation error
    if (err.message && err.message.includes("Password must be at least")) {
      res.status(400).json({ message: err.message });
      return;
    }
    if (err.name === "ValidationError") {
      // Handle other validatoin errors
      res.status(400).json({ message: err.message });
      return;
    }
    if (err.code === 11000) {
      // Duplicate key error
      res.status(409).json({ message: userExistsMsg });
      return;
    }
    console.error("Error occured:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
    return;
  }
};

// Controller for logging in a user
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User does not exist." });
      return;
    }

    // If user exists, we compare passwords
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }
  } catch (err: any) {}
  res.status(200).send({
    message: loginSuccessMsg,
    token: mockToken,
  });
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
