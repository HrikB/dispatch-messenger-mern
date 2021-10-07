import express from "express";
import mongoose from "mongoose";

let friendRequestSchema = new mongoose.Schema({
  requester: {
    type: int,
    required: true,
  },
  recipient: {
    type: int,
    required: true,
  },
  status: {
    type: int,
    required: true,
  },
});

export default mongoose.model("FriendRequest", friendRequestSchema);
