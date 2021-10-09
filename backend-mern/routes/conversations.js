import express from "express";
import {
  createConversation,
  getConversation,
} from "../controllers/conversations.js";

const router = express.Router();

router.post("/create-chat", createConversation);
router.get("/data/:userId", getConversation);

export default router;
