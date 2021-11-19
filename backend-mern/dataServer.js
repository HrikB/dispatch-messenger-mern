import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import util from "util";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";
import User from "./models/User.js";
import Message from "./models/Message.js";
import FriendRequest from "./models/FriendRequest.js";
import Conversation from "./models/Conversation.js";
import redisClient from "./helpers/redis.js";
import { verifyAccessToken } from "./helpers/jwt.js";
import "./helpers/mongodb.js";

dotenv.config();

//App Config
const app = express();
const port = 7000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: `http://${process.env.SERVER_HOST}:3000`,
  },
});

//OK for now... eventually, move this array onto redis
const addUser = async (userId, socketId) => {
  redisClient.hset = util.promisify(redisClient.hset);
  await redisClient.hset("socketConns", userId, socketId);
};

const removeUser = async (userId) => {
  redisClient.hdel = util.promisify(redisClient.hdel);
  await redisClient.hdel("socketConns", userId);
};

const getUser = async (userId) => {
  redisClient.hget = util.promisify(redisClient.hget);
  const socketId = await redisClient.hget("socketConns", userId);
  return socketId;
};

//socket-io
io.use((socket, next) => {
  console.log("middleware running", socket.id);
  if (socket.handshake.auth && socket.handshake.auth.accessToken) {
    jwt.verify(
      socket.handshake.auth.accessToken,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decoded) => {
        console.log("err??", err);
        if (err) return next(createError.Unauthorized());
        console.log("valid jwt");
        socket.decoded = decoded;
        next();
      }
    );
  } else {
    next(createError.Unauthorized());
  }
}).on("connection", (socket) => {
  console.log("connect!!");
  io.emit("welcome", "This is the socket. Hi!");

  //take the userId and socketId from client
  socket.on("sendUser", async (userId) => {
    console.log(userId, "connected!");

    await addUser(userId, socket.id);
  });

  //sending and getting message
  socket.on(
    "sendMessage",
    async ({
      conversationId,
      senderId,
      senderName,
      receiver,
      text,
      createdAt,
    }) => {
      console.log("sendMessage received");
      //if userSocket is undefined, the client to recieve the message is offline
      const userSocket = await getUser(receiver);
      if (userSocket) {
        console.log("sendMessage emitted");
        io.to(userSocket).emit("getMessage", {
          conversationId,
          senderId,
          senderName,
          text,
          createdAt,
        });
      } else {
        console.log(receiver, "is currently offline");
      }

      try {
        const savedMessage = await new Message({
          conversationId,
          senderId,
          senderName,
          text,
          createdAt,
        }).save();

        //last message is updated async
        await Conversation.updateOne(
          { _id: conversationId },
          { $set: { last_msg: savedMessage } }
        );
      } catch (err) {
        console.error(err);
      }
    }
  );

  //sending and getting friend requests
  socket.on(
    "sendFriendRequest",
    async ({ senderId, senderName, senderProfPic, receiverEmail }) => {
      console.log("sendFriendRequest received");
      //get receiver object with the email
      const receiver = await User.findOne({ email: receiverEmail });

      //get sender socket
      const senderSocket = await getUser(senderId.toString());

      //if receiver email exists in database
      if (receiver) {
        //get recevier socket
        const receiverSocket = await getUser(receiver._id.toString());

        //check if user is sending request to themselves
        if (receiver._id.toString() === senderId) {
          io.to(senderSocket).emit("samePersonRequest", {
            message: "Oops. You can't send yourself a friend request",
          });
          return;
        }
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
              requesterProfPic: senderProfPic,
              recipientProfPic: receiver.prof_pic,
            }).save();
            //if receiver is connected to socket
            if (receiverSocket) {
              console.log("emitting Friend request");
              io.to(receiverSocket).emit("getFriendRequest", {
                id,
                senderId,
                senderName,
                senderProfPic,
              });
            }
            io.to(senderSocket).emit("successfulRequest", {
              message: "Success! Your friend request was sent",
            });
          } else {
            //emit error that request already exists
            io.to(senderSocket).emit("requestExists", {
              message:
                "There is already a pending request between you and this user",
            });
            console.log("Already exists");
          }
        } else {
          //emit error that the requester and receiver are already friends
          io.to(senderSocket).emit("alreadyFriends", {
            message: "You and this user are already friends on Dispatch",
          });
          console.log("Already friends");
        }
      } else {
        //the receiverEmail search did not yield a user
        io.to(senderSocket).emit("emailNotFound", {
          message:
            "There is no dispatch account assoicated with that email. Please try again.",
        });
        //emit an error
      }
    }
  );

  socket.on(
    "respondToRequest",
    async ({ requestId, requesterId, recipientId, response }) => {
      //console.log(requestId, requesterId, recipientId, response);
      //response was rejected, delete from database
      console.log("respondToRequest received");

      await FriendRequest.deleteOne({ _id: requestId });
      const requesterSocket = await getUser(requesterId.toString());
      const receiverSocket = await getUser(recipientId.toString());
      if (response == 1) {
        const requesterObject = await User.findOneAndUpdate(
          { _id: requesterId },
          { $addToSet: { friendsList: recipientId } }
        );
        const receiverObject = await User.findOneAndUpdate(
          { _id: recipientId },
          { $addToSet: { friendsList: requesterId } }
        );
        if (requesterSocket) {
          console.log("respondToRequest emitted");
          const _id = receiverObject._id;
          const first = receiverObject.first_name;
          const last = receiverObject.last_name;
          const prof_pic = receiverObject.prof_pic.toString();
          io.to(requesterSocket).emit("newFriend", {
            _id,
            first,
            last,
            prof_pic,
          });
        }
        if (receiverSocket) {
          console.log("respondToRequest emitted");
          const _id = requesterObject._id;
          const first = requesterObject.first_name;
          const last = requesterObject.last_name;
          const prof_pic = receiverObject.prof_pic.toString();
          io.to(receiverSocket).emit("newFriend", {
            _id,
            first,
            last,
            prof_pic,
          });
        }
      } else {
        if (requesterSocket) {
          io.to(requesterSocket).emit("rejectRequest", {
            requestId,
          });
        }
        if (receiverSocket) {
          io.to(receiverSocket).emit("rejectRequest", {
            requestId,
          });
        }
      }
    }
  );

  //client attempting to create 1 to 1 chat
  socket.on("newPrivateChat", async ({ senderId, receiverId }) => {
    console.log("newPrivateChat emitted");

    const existingConversation = await Conversation.findOne({
      members: { $size: 2, $all: [senderId, receiverId] },
    });
    const receiverSocket = await getUser(receiverId.toString());
    if (!existingConversation) {
      const _id = mongoose.Types.ObjectId();
      const newConversation = new Conversation({
        _id: _id,
        members: [senderId, receiverId],
        messages: [],
        hidden: false,
      });
      //checks if receiver is connected to socket

      if (receiverSocket) {
        console.log("otherPerson emitted");
        io.to(receiverSocket).emit("getNewChat", newConversation);
      }
      console.log("samePerson emitted");
      io.to(await getUser(senderId.toString())).emit(
        "getNewChat",
        newConversation
      );
      newConversation.save();
      io.to(await getUser(senderId.toString())).emit("openMessage", { _id });
    } else {
      //conversation between these two users already exists, simply open
      const _id = existingConversation._id;
      console.log("openMessage emitted");
      io.to(await getUser(senderId.toString())).emit("openMessage", { _id });
    }
  });

  //client removing friend
  socket.on("removeFriend", async ({ removerId, toRemoveId }) => {
    //if being removed is online
    const beingRemovedSocket = await getUser(toRemoveId.toString());
    const removingSocket = await getUser(removerId.toString());

    //removing from friendslists
    const resRemover = await User.updateOne(
      { _id: removerId },
      { $pull: { friendsList: toRemoveId } }
    );
    const resToRemove = await User.updateOne(
      { _id: toRemoveId },
      { $pull: { friendsList: removerId } }
    );

    //notify respective clients of removal
    if (beingRemovedSocket) {
      io.to(beingRemovedSocket).emit("friendRemoved", removerId);
    }
    io.to(removingSocket).emit("friendRemoved", toRemoveId);

    //delete conversation
    const deleteConversation = await Conversation.findOne({
      members: { $size: 2, $all: [removerId, toRemoveId] },
    });
    if (!deleteConversation) return;

    await Conversation.deleteOne({ _id: deleteConversation._id });

    //delete messages
    await Message.deleteMany({ conversationId: deleteConversation._id });

    //notify clients to remove conversation
    if (beingRemovedSocket) {
      io.to(beingRemovedSocket).emit(
        "removeConversation",
        deleteConversation._id
      );
    }
    io.to(removingSocket).emit("removeConversation", deleteConversation._id);
  });

  //when client disconnects from the socket
  socket.on("disconnect", async () => {
    console.log(socket.handshake.auth.userId, "disconnected!");
    const disconnecting = await getUser(socket.handshake.auth.userId);
    console.log(disconnecting);
    io.to(disconnecting).emit("disconnectClient");
    await removeUser(socket.handshake.auth.userId);
  });
});

//Routes Import
import conversationsRoute from "./routes/conversations.js";
import messageRoute from "./routes/messages.js";
import requestRoute from "./routes/friendsRequests.js";
import userRoute from "./routes/user.js";
import imageRoute from "./routes/images.js";

//Middlewares
app.use(express.json());
app.use(
  cors({
    origin: `http://${process.env.SERVER_HOST}:3000`,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(verifyAccessToken);

//API Endpoints
app.get("/", async (req, res) => {
  res.status(200).send("Data Server Up");
});

app.use("/api/conversations", conversationsRoute);
app.use("/api/messages", messageRoute);
app.use("/api/requests", requestRoute);
app.use("/api/user", userRoute);
app.use("/api/images", imageRoute);

//Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

//Listener
httpServer.listen(port, () => console.log(`listening on localhost: ${port}`));
