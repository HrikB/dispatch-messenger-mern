import { uploadMiddleware } from "../models/Images.js";
import express from "express";

import { uploadImage, getImage } from "../controllers/images.js";

const router = express.Router();

router.post("/upload", uploadMiddleware, uploadImage);
router.get("/:id", getImage);

export default router;
