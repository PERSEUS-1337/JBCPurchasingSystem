import { Request, Response } from "express";
import User from "../models/userModel";
import { generateJWT } from "../utils/jwtUtils";
import { checkDuplicateUser } from "../services/userService";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Assume already validated by zod middleware
    const user = new User(req.body);

    // Check for duplicate username or email
    const isDuplicate = await checkDuplicateUser(user.username, user.email);
    if (isDuplicate) {
      res.status(409).json({ message: "Username or email already exists" });
      return;
    }

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      username: user.username,
    });

    return;
  } catch (err: any) {
    // Log and handle unexpected errors
    res.status(500).json({ message: "Internal server error", error: err });
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
      res.status(404).json({ message: "User does not exist." });
      return;
    }

    // If user exists, compare passwords
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const token = await generateJWT(user.userID);

    // On successful login, return response
    res.status(200).json({
      message: "Login successful",
      bearer: token,
    });
  } catch (err: any) {
    // Handle other errors
    res.status(500).json({ message: "Internal server error", error: err });
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
