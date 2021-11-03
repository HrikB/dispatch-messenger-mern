import express from "express";
import {
  getDataById,
  getDataByEmail,
  updateProfilePic,
  updateFirstName,
  updateLastName,
} from "../controllers/user.js";

const router = express.Router();
router.get("/user-id/:id", getDataById);
router.get("/user-email/:email", getDataByEmail);
router.put("/update-profile/pic", updateProfilePic);
router.put("/update-profile/first-name", updateFirstName);
router.put("/update-profile/last-name", updateLastName);

export default router;
