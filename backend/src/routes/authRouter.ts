import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  changePassword,
} from "../controllers/authController";
import { userSchema } from "../validators/userValidator";
import { changePasswordSchema, loginSchema, registerSchema } from "../validators/authValidator";
import { validateRequest } from "../middlewares/validationMiddleware";
import { authorizeJWT } from "../middlewares/authorizationMiddleware";

const router = Router();

// Routes for authentication
router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public auth route" });
});
router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.get("/refresh", refreshUserToken);

// Protected Routes
router.get("/protected", authorizeJWT, (req, res) => {
  res.status(200).json({ message: "This is the auth protected route" });
});

// Password Management
router.post(
  "/change-pwd",
  authorizeJWT,
  validateRequest(changePasswordSchema),
  changePassword
); // Change user password

export default router;
