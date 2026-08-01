import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getRandomUsers,
  getUser,
  login,
  register,
  updateUser,
} from "../controllers/userController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/random", getRandomUsers);
router.get("/:username", getUser);
router.patch("/", verifyToken, updateUser);

export default router;
