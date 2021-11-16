import Message from "../models/Message.js";
import createError from "http-errors";
import Conversation from "../models/Conversation.js";

//api routes
export let getMessage = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
    });

    if (!conversation.members.includes(req.payload.sub))
      throw new createError.Unauthorized();
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    console.log("5", err.message);
    next(createError.InternalServerError());
  }
};
