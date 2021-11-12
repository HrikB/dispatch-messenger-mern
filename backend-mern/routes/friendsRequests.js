import express from "express";
import {
  getRequest,
  sendRequest,
  getAllFriends,
  removeFriend,
} from "../controllers/request.js";

const router = express.Router();
router.get("/get-request/:userId", getRequest);
router.post("/send-request", sendRequest);
router.put("/remove", removeFriend);
router.get("/friends/:userId", getAllFriends);

export default router;
