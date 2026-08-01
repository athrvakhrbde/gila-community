import { Router } from "express";
import {
  optionallyVerifyToken,
  verifyToken,
} from "../middleware/auth.js";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getUserLikedPosts,
  getUserLikes,
  likePost,
  unlikePost,
  updatePost,
} from "../controllers/postController.js";

const router = Router();

router.get("/", optionallyVerifyToken, getPosts);
router.post("/", verifyToken, createPost);
router.get("/liked/:id", optionallyVerifyToken, getUserLikedPosts);
router.get("/:id/like", getUserLikes);
router.post("/:id/like", verifyToken, likePost);
router.delete("/:id/like", verifyToken, unlikePost);
router.get("/:id", optionallyVerifyToken, getPost);
router.patch("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

export default router;
