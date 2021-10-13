import express from "express";
import {
  getRequest,
  sendRequest,
  getAllFriends,
} from "../controllers/request.js";

const router = express.Router();
router.get("/get-request/:userId", getRequest);
router.post("/send-request", sendRequest);
router.get("/friends/:userId", getAllFriends);

export default router;
