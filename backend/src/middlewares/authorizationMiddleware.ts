import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";

const SECRET_KEY: string = process.env.SECRET_KEY as string;

export const authorizeJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "Access denied, no token provided" });
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
    res.status(401).json({ message: "Invalid or expired token", error: err });
    return;
  }
};

export const authorizeSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user; // Assume `req.user` is set by `authenticateJWT`

  if (!user || user.isSuperAdmin()) {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }

  next(); // Proceed to the next middleware or controller
  return;
};
