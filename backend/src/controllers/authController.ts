import { Request, Response } from "express";
import User, { IUser } from "../models/userModel";
import { generateJWT } from "../utils/authUtils";
import { LoginInput, RegisterInput } from "../validators";

/**
 * Registers a new user in the system
 * @param req Express Request object containing registration data in req.body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 409 if email already exists
 * @throws 500 if server error occurs
 */
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newUserData: RegisterInput = req.body;

    const isDuplicate = await User.checkDuplicateUser(newUserData.email);
    if (isDuplicate) {
      res.status(409).json({ message: "Email already exists", data: null });
      return;
    }

    const newUser: IUser = new User(newUserData);
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      data: { email: newUser.email, createdAt: newUser.createdAt },
    });
  } catch (err: any) {
    // Log and handle unexpected errors
    res.status(500).json({
      message: "Internal server error",
      data: null,
      error: err.message,
    });
  }
};

/**
 * Authenticates a user and generates a JWT token
 * @param req Express Request object containing login credentials in req.body
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if user does not exist
 * @throws 401 if credentials are invalid
 * @throws 500 if server error occurs
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User does not exist.", data: null });
      return;
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      res.status(401).json({ message: "Invalid credentials.", data: null });
      return;
    }

    const token = await generateJWT(user.userID);

    res.status(200).json({
      message: "Login successful",
      data: { bearer: token },
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      data: null,
      error: err.message,
    });
  }
};

// TODO: logoutUser Controller Function
/**
 * Logs out a user (currently just returns success message)
 * @param req Express Request object
 * @param res Express Response object
 * @returns void
 */
export const logoutUser = (req: Request, res: Response): void => {
  res.status(200).json({ message: "Logout successful", data: null });
};

// TODO: refreshToken Controller Function
/**
 * Refreshes user's JWT token (currently returns mock token)
 * @param req Express Request object
 * @param res Express Response object
 * @returns void
 */
export const refreshUserToken = (req: Request, res: Response): void => {
  res.status(200).json({
    message: "Token refreshed",
    data: { token: "new-mock-jwt-token" },
  });
};

/**
 * Changes user's password after verifying current password
 * @param req Express Request object containing passwords in req.body and userID in req.user
 * @param res Express Response object
 * @returns Promise<void>
 * @throws 404 if user not found
 * @throws 400 if current password is incorrect
 * @throws 500 if server error occurs
 */
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { userID } = req.user;
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
