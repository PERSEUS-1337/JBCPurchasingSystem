import { Router } from "express";
import {
  getUser,
  getUserByID,
  updateUser,
} from "../controllers/userController";
import {
  authorizeJWT,
  authorizeSuperAdmin,
} from "../middlewares/authorizationMiddleware";

const router = Router();

router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public user route" });
});

router.get("/me", authorizeJWT, getUser);
router.get("/:userID", authorizeJWT, authorizeSuperAdmin, getUserByID);
router.post("/update", authorizeJWT, updateUser);

export default router;
