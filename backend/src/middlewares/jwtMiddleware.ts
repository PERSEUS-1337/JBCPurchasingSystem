import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";

// Secret key (you can store this in environment variables)
const SECRET_KEY: string = process.env.SECRET_KEY as string;

// Middleware to authenticate and verify JWT in requests
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    res.status(403).json({ message: "Access denied, no token provided" });
    return;
  }

  try {
    // Verify the JWT with the secret key
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );
    req.body = payload; // Attach user info to request object for access in controllers
    console.log(req.body);
    next();
    return;
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
