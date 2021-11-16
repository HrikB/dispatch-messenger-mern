import express from "express";
import { getMessage } from "../controllers/messages.js";

const router = express.Router();

router.get("/get-message/:conversationId", getMessage);

export default router;
