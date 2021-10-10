import express from "express";
import {
  createConversation,
  getConversations,
  getConversation,
} from "../controllers/conversations.js";

const router = express.Router();

router.post("/create-chat", createConversation);
router.get("/all-conversations/:userId", getConversations);
router.get("/conversation-data/:conversationId", getConversation);

export default router;
