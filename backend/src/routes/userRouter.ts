import { Router } from "express";
import {
  getUser,
  getUserByID,
  editUser as editUser,
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
router.put("/edit", authorizeJWT, authorizeSuperAdmin, editUser);

export default router;
