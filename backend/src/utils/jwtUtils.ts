import { SignJWT } from "jose";

// Secret key (you can store this in environment variables)
const SECRET_KEY: string = process.env.SECRET_KEY as string;

// Middleware to create JWT (this can be used in your login or register controllers)
export const generateJWT = async (userID: string) => {
  const jwt = await new SignJWT({ userID })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m") // Set token expiration time
    .sign(new TextEncoder().encode(SECRET_KEY)); // Signing with the secret key

  return jwt;
};
