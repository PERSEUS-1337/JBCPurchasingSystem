import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { jwtVerify, SignJWT } from "jose";

// Load environment variables
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

// Secret key (you can store this in environment variables)
const SECRET_KEY: string = process.env.SECRET_KEY as string;

// Middleware to create JWT (this can be used in your login or register controllers)
export const generateJWT = async (userId: string) => {
  const jwt = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m") // Set token expiration time
    .sign(new TextEncoder().encode(SECRET_KEY)); // Signing with the secret key

  return jwt;
};

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
    // req.user = payload; // Attach user info to request object for access in controllers
    next();
    return;
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
