import { Router } from "express";
import {
  getUser,
  editUser as editUser,
  getUserByID,
  deleteUser,
} from "../controllers/userController";
import {
  authorizeJWT,
  authorizeSuperAdmin,
} from "../middlewares/authorizationMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { userUpdateSchema } from "../validators";

const router = Router();

router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public user route" });
});

router.get("/me", authorizeJWT, getUser);
router.get("/:userID", authorizeJWT, authorizeSuperAdmin, getUserByID);
router.put("/:userID", authorizeJWT, authorizeSuperAdmin, validateRequest(userUpdateSchema), editUser);
router.delete("/:userID", authorizeJWT, authorizeSuperAdmin, deleteUser);

export default router;
