import { Request, Response } from "express";
import User from "../models/userModel"; // Import the user model

export const getLoggedInUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    /* NOTE
     * Syntax of findOne of mongoose may differ from the usual convention
     * e.g.: you may not want to pass the value straight to findOne({}) and instead pass either a json object or a dict, so that the function itself will just reference the very first k/v pair stored in it.
     * In this case, it works like that since req.user contains:
     * {
     *   userID: "U001",
     *   iex: 1xxx000
     * }
     *
     * Therefore, letting the userID be referenced by the findOne function and use it to find a user
     */
    const { userID } = req.user;
    const user = await User.findOne({ userID }).lean(); // Converts Mongoose document to plain JS object

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const { password, __v, ...filteredUser } = user; // Exclude sensitive fields
    res.status(200).json(filteredUser); // Return the user data
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

// Get user by ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userID } = req.params; // Extract userID from request params

    const user = await User.findOne({ userID });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json(user); // Return the user data
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error", error: err });
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
    }).lean(); // Convert Mongoose Document to plain JS object
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const { password, __v, ...filteredUser } = user; // Exclude sensitive fields

    res.status(200).json({
      message: "User details updated successfully",
      user: filteredUser,
    });
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};
