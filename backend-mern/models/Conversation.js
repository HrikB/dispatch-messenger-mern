import mongoose from "mongoose";
import { messageSchema } from "./Message.js";

const conversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    last_msg: {
      type: messageSchema,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Conversation", conversationSchema);
