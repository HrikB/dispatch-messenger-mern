import express from "express";
import { getRequest, sendRequest } from "../controllers/request.js";

const router = express.Router();
router.get("/getRequest", getRequest);
router.post("/sendRequest", sendRequest);

export default router;
