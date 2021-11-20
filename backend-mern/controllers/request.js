import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import createError from "http-errors";

//api routes
export const getRequest = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({
      $or: [
        { requesterId: req.params.userId },
        { recipientId: req.params.userId },
      ],
    });
    console.log(requests);
    res.status(200).json(requests);
  } catch (err) {
    console.log("2", err.message);
    next(createError.InternalServerError());
  }
};

export const getAllFriends = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });

    const friends = await User.find(
      { _id: { $in: user.friendsList } },
      { password: 0, email: 0, createdAt: 0, updatedAt: 0, friendList: 0 }
    );
    res.status(200).json(friends);
  } catch (err) {
    next(createError.InternalServerError());
  }
};
