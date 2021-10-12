import express from "express";
import {
  signup,
  signin,
  token,
  logout,
  getData,
  getDataByEmail,
} from "../controllers/auth.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/token", token);
router.delete("/logout", logout);
router.get("/data/:id", getData);
router.get("/data-email/:email", getDataByEmail);

export default router;
