import mongoose from "mongoose";

export const messageSchema = mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    senderName: {
      type: String,
    },
    text: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);
