import express from "express";
import { getVoiceMessage } from "../controllers/audio.js";

const router = express.Router();

router.get("/:id", getVoiceMessage);
