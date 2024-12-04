import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
} from "../controllers/authController";

const router = Router();

// Routes for authentication
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);

export default router;
