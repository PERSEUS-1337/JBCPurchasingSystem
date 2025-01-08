import { Router } from "express";
import { authenticateJWT } from "../middlewares/jwtMiddleware";
import {
  getLoggedInUserDetails,
  getUserById,
  updateUser,
  viewUser,
} from "../controllers/userController";

const router = Router();

router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public user route" });
});

router.get("/me", authenticateJWT, getLoggedInUserDetails);
router.get("/:userID", authenticateJWT, getUserById);
router.get("/:userID", authenticateJWT, viewUser)
router.post("/update", authenticateJWT, updateUser);

export default router;
