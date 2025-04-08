import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import User from "../models/userModel";

const SECRET_KEY: string = process.env.SECRET_KEY as string;

export const authorizeJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied: No token provided" });
    return;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );
    req.user = payload;
    next();
    return;
  } catch (err: any) {
    res
      .status(401)
      .json({ message: "Access denied: Invalid or expired token", error: err });
    return;
  }
};

export const authorizeSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user } = req; // Assume `req.user` is set by `authorizeJWT`

    if (!user || !user.userID) {
      res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated." });
      return;
    }

    const dbUser = await User.findOne({ userID: user.userID });

    if (!dbUser) {
      res.status(403).json({ message: "Forbidden: User not found." });
      return;
    }

    if (!(await User.isSuperAdmin(dbUser.role))) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions." });
      return;
    }

    next();
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: err.message });
  }
};