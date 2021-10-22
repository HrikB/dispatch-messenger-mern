import express from "express";
import { signup, signin, token, logout } from "../controllers/auth.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/token", token);
router.delete("/logout", logout);

export default router;
