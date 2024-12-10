import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
} from "../controllers/authController";
import { authenticateJWT } from "../middlewares/jwtMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { loginSchema } from "../validators/loginValidator";
import { userSchema } from "../validators/userValidator";

const router = Router();

// Routes for authentication
router.get("/hello", (req, res) => {
  res.json({ messge: "This is the public auth route" });
});
router.post("/register", validateRequest(userSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);
router.get("/refresh", refresh);

router.get("/protected", authenticateJWT, (req, res) => {
  res.json("This is the auth protected route");
});
export default router;
