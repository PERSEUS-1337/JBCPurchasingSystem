import { Request, Response } from "express";
import User from "../models/userModel"; // Import the user model

export const viewUser = async (
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
    const user = await User.findOne({ userID }); // Converts Mongoose document to plain JS object
  
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // const { password, __v, ...filteredUser } = user; // Exclude sensitive fields
    const data = await user.getPersonalProfile();
    res.status(200).json(data); // Return the user data
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

export const viewUserByID = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID } = req.params;
    const requestingUser = req.user; // User making the request (from JWT middleware)

    if (requestingUser.role === "Super Administrator") {
      const user = await User.findOne({ userID });
  
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user.getAdminView());
    } else {
      res.status(403).json({ message: "Unauthorized access" });
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// export const listUsers = async (req: Request, res: Response) => {
//   try {
//     const requestingUser = req.user; // User making the request (from JWT middleware)

//     if (requestingUser.role !== "Super Administrator") {
//       return res.status(403).json({ message: "Unauthorized access" });
//     }

//     // Fetch all users but filter their data for public view
//     const users = await User.find();
//     const secureUsers = users.map((user) => user.getPublicProfile());

//     res.status(200).json(secureUsers);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: err.message });
//   }
// };

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
