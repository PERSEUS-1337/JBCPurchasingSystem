import { Router } from "express";
import { authenticateJWT } from "../middlewares/jwtMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { userSchema } from "../validators/userValidator";
import { getLoggedInUserDetails } from "../controllers/userController";

const router = Router();

router.get("/hello", (req, res) => {
  res.status(200).json({ messge: "This is the public user route" });
});

router.get("/me", authenticateJWT, getLoggedInUserDetails);

export default router;
