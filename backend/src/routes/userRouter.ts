import { Router } from "express";
import {
  viewUser,
  viewUserByID,
  updateUser,
} from "../controllers/userController";
import { authorizeJWT, authorizeSuperAdmin } from "../middlewares/authorizationMiddleware";

const router = Router();

router.get("/hello", (req, res) => {
  res.status(200).json({ message: "This is the public user route" });
});

router.get("/me", authorizeJWT, viewUser);
router.get("/:userID", authorizeJWT, authorizeSuperAdmin, viewUserByID);
router.post("/update", authorizeJWT, updateUser);

export default router;
