import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createComment,
  deleteComment,
  getPostComments,
  getUserComments,
  updateComment,
} from "../controllers/commentController.js";

const router = Router();

router.post("/:id", verifyToken, createComment);
router.get("/post/:id", getPostComments);
router.get("/user/:id", getUserComments);
router.patch("/:id", verifyToken, updateComment);
router.delete("/:id", verifyToken, deleteComment);

export default router;
