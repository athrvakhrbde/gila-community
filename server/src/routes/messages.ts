import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const router = Router();

router.get("/", verifyToken, getConversations);
router.post("/:id", verifyToken, sendMessage);
router.get("/:id", verifyToken, getMessages);

export default router;
