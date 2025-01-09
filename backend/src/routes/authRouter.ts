import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  changePassword,
} from "../controllers/authController";
import { loginSchema } from "../validators/loginValidator";
import { userSchema } from "../validators/userValidator";
import { changePasswordSchema } from "../validators/authValidator";
import { validateRequest } from "../middlewares/validationMiddleware";
import { authorizeJWT } from "../middlewares/authorizationMiddleware";

const router = Router();

// Routes for authentication
router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public auth route" });
});
router.post("/register", validateRequest(userSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);
router.get("/refresh", refresh);

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
