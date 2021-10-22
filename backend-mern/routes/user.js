import express from "express";
import { getDataById, getDataByEmail } from "../controllers/user.js";

const router = express.Router();
router.get("/user-id/:id", getDataById);
router.get("/user-email/:email", getDataByEmail);

export default router;
