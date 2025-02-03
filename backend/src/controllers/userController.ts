import { Request, Response } from "express";
import User from "../models/userModel";

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

// TODO: Update function by making sure to exclude fields being edited by users, and only allowed to be edited by the administrator
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userID } = req.user;
    const updates = req.body;

    const user = await User.findOneAndUpdate({ userID }, updates, {
      new: true,
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { password, __v, ...filteredUser } = user;

    res.status(200).json({
      message: "User details updated successfully",
      data: filteredUser,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
      data: null,
      error: err.message,
    });
  }
};
