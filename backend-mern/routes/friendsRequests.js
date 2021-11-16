import express from "express";
import { getRequest, getAllFriends } from "../controllers/request.js";

const router = express.Router();
router.get("/get-request/:userId", getRequest);
router.get("/friends/:userId", getAllFriends);

export default router;
