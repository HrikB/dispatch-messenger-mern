import express from "express";
import { getRequest, sendRequest } from "../controllers/request.js";

const router = express.Router();
router.get("/get-request/:userId", getRequest);
router.post("/send-request", sendRequest);

export default router;
