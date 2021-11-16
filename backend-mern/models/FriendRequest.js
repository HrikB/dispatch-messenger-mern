import express from "express";
import mongoose from "mongoose";

let friendRequestSchema = new mongoose.Schema({
  requesterId: {
    type: String,
    required: true,
  },
  recipientId: {
    type: String,
    required: true,
  },
  requesterName: {
    type: String,
  },
  recipientName: {
    type: String,
  },
  requesterProfPic: {
    type: String,
  },
  recipientProfPic: {
    type: String,
  },
});

export default mongoose.model("FriendRequest", friendRequestSchema);
