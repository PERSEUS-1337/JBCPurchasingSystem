import { Request, Response } from "express";
import User from "../models/userModel";
import { generateJWT } from "../utils/authUtils";
import { checkDuplicateUser } from "../utils/userUtils";

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Assume already validated by zod middleware
    const user = new User(req.body);

    // Check for duplicate username or email
    const isDuplicate = await checkDuplicateUser(user.username, user.email);
    if (isDuplicate) {
      res
        .status(409)
        .json({ message: "Username or email already exists", data: null });
      return;
    }

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      data: { username: user.username },
    });
  } catch (err: any) {
    // Log and handle unexpected errors
    res
      .status(500)
      .json({
        message: "Internal server error",
        data: null,
        error: err.message,
      });
  }
};

// Controller for logging in a user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Assume that it is already validated with zod middleware
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User does not exist.", data: null });
      return;
    }

    // If user exists, compare passwords
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      res.status(401).json({ message: "Invalid credentials.", data: null });
      return;
    }

    const token = await generateJWT(user.userID);

    // On successful login, return response
    res.status(200).json({
      message: "Login successful",
      data: { bearer: token },
    });
  } catch (err: any) {
    // Handle other errors
    res
      .status(500)
      .json({
        message: "Internal server error",
        data: null,
        error: err.message,
      });
  }
};

// TODO: Controller for logging out a user
export const logout = (req: Request, res: Response): void => {
  res.status(200).json({ message: "Logout successful", data: null });
};

// Controller for refreshing a token
export const refresh = (req: Request, res: Response): void => {
  res.status(200).json({
    message: "Token refreshed",
    data: { token: "new-mock-jwt-token" },
  });
};

// Controller for changing the password
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { userID } = req.user; // Assuming `req.user` contains the authenticated user
    const user = await User.findOne({ userID });
    if (!user) {
      res.status(404).json({ message: "User not found", data: null });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res
        .status(400)
        .json({ message: "Current password is incorrect", data: null });
      return;
    }

    // Hash and save the new password
    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ message: "Password changed successfully", data: null });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Server error", data: null, error: error.message });
  }
};
