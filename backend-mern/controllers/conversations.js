import Conversation from "../models/Conversation.js";
import createError from "http-errors";

//api routes
export let getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    }).sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (err) {
    console.log("3", err.message);
    next(createError.InternalServerError());
  }
};

export let getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
    });

    if (!conversation.members.includes(req.payload.sub))
      throw new createError.Unauthorized();
    res.status(200).json(conversation);
  } catch (err) {
    console.log("4", err);
    next(createError.InternalServerError());
  }
};

//socket functions
export let createConversation = async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
    messages: [],
    hidden: false,
  });

  try {
    const existingConversation = await Conversation.find({
      members: { $size: 2, $all: [req.body.senderId, req.body.receiverId] },
    });
    if (!existingConversation) {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } else {
      res.status(500).json({
        errors: [{ error: "Conversation between these users already exists" }],
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
