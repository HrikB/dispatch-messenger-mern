import express from "express";
import { sendMessage, getMessage } from "../controllers/messages.js";

const router = express.Router();

router.post("/send-message", sendMessage);
router.get("/get-message/:conversationId", getMessage);

export default router;
