import { Request, Response } from "express";
import User from "../models/userModel";

/**
 * Retrieves the profile of the currently authenticated user
 * @param req Express Request object containing user info from JWT in req.user
 * @param res Express Response object
 * @returns Promise<void>
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID } = req.user;
    const user = await User.findOne({ userID });

    if (!user) {
      res.status(404).json({ message: "User not found", data: null });
      return;
    }

    const data = await user.getUser();
    res
      .status(200)
      .json({ message: "User profile retrieved successfully", data });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Retrieves user details by userID (Admin view)
 * @param req Express Request object containing userID in params
 * @param res Express Response object
 * @returns Promise<void>
 * @requires SuperAdmin authorization middleware
 */
export const getUserByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // At this point, already assume that the requester of this api, the one logged in the JWT, has already been verified at previous middlewares, particularly authorizeSuperAdmin, therefore there is no need to check at this stage as it just consumes more memory
    const { userID } = req.params;

    const user = await User.findOne({ userID });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const data = await user.getUserAdminView();
    res
      .status(200)
      .json({ message: "User details retrieved successfully", data });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Updates user details by userID
 * @param req Express Request object containing userID in params and update data in body
 * @param res Express Response object
 * @returns Promise<void>
 * @note Password and role fields are excluded from the update projection
 */
export const editUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID } = req.params;

    const updates = req.body;

    const user = await User.findOneAndUpdate({ userID }, updates, {
      new: true,
      projection: {
        password: 0,
        role: 0,
        _id: 0,
        __v: 0,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User details updated successfully",
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      data: null,
      error: err.message,
    });
  }
};

/**
 * Deletes a user by userID
 * @param req Express Request object containing userID in params
 * @param res Express Response object
 * @returns Promise<void>
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userID } = req.params;

    // Find the user to delete
    const user = await User.findOneAndDelete({ userID });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User deleted successfully",
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      data: null,
      error: err.message,
    });
  }
};
