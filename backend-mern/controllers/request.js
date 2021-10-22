import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
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
    res.status(200).json(requests);
  } catch (err) {
    console.log("2", err.message);
    next(createError.InternalServerError());
  }
};

export const getAllFriends = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId });

    const friends = await User.find({ _id: { $in: user.friendsList } });
    res.status(200).json(friends);
  } catch (err) {
    next(createError.InternalServerError());
  }
};

//socket functions
export const sendRequest = async ({ senderId, senderName, receiverEmail }) => {
  //get receiver object with the email
  const receiver = await User.findOne({ email: receiverEmail });
  //if receiver email exists in database
  if (receiver) {
    const user = getUser(receiver._id);
    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          requesterId: senderId,
          recipientId: receiver._id,
        },
        {
          requesterId: receiver._id,
          recipientId: senderId,
        },
      ],
    });
    if (!receiver.friendsList.includes(senderId)) {
      if (!existingRequest) {
        const id = mongoose.Types.ObjectId();
        const savedFriendRequest = new FriendRequest({
          _id: id,
          requesterId: senderId,
          recipientId: receiver._id,
          requesterName: senderName,
          recipientName: receiver.first_name + " " + receiver.last_name,
        }).save();
        //if user is connected to socket
        if (user) {
          io.to(user.socketId).emit("getFriendRequest", {
            id,
            senderId,
            senderName,
          });
        }
      } else {
        //emit error that request already exists
        console.log("Already exists");
      }
    } else {
      //emit error that the requester and receiver are already friends
      console.log("Already friends");
    }
  } else {
    //the receiverEmail search did not yield a user
    //emit an error
  }
};

export const respondToRequest = async ({
  requestId,
  requesterId,
  recipientId,
  response,
}) => {
  //console.log(requestId, requesterId, recipientId, response);
  //response was rejected, delete from database

  await FriendRequest.deleteOne({ _id: requestId });
  if (response == 1) {
    const requester = getUser(requesterId);
    const receiver = getUser(recipientId);
    const requesterObject = await User.findOneAndUpdate(
      { _id: requesterId },
      { $addToSet: { friendsList: recipientId } }
    );
    const receiverObject = await User.findOneAndUpdate(
      { _id: recipientId },
      { $addToSet: { friendsList: requesterId } }
    );
    if (requester) {
      const _id = receiverObject._id;
      const first = receiverObject.first_name;
      const last = receiverObject.last_name;
      io.to(requester.socketId).emit("newFriend", { _id, first, last });
    }
    if (receiver) {
      const _id = requesterObject._id;
      const first = requesterObject.first_name;
      const last = requesterObject.last_name;
      io.to(receiver.socketId).emit("newFriend", { _id, first, last });
    }
  }
};
