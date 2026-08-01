import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getMe,
  getRandomUsers,
  getUser,
  login,
  register,
  updateUser,
} from "../controllers/userController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.get("/random", getRandomUsers);
router.patch("/", verifyToken, updateUser);
router.get("/:username", getUser);

export default router;
