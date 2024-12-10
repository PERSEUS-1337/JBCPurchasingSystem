import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
} from "../controllers/authController";
import { authenticateJWT } from "../middlewares/jwtMiddleware";

const router = Router();

// Routes for authentication
router.get("/hello", (req, res) => {
  res.json({ messge: "This is the public auth route" });
});
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);

router.get("/protected", authenticateJWT, (req, res) => {
  res.json("This is the auth protected route");
});
export default router;
