import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import User from "./models/User.js";
import Message from "./models/Message.js";
import FriendRequest from "./models/FriendRequest.js";
import Conversation from "./models/Conversation.js";
import { respondToRequest, sendRequest } from "./controllers/request.js";
import { sendMessage } from "./controllers/messages.js";
import "./helpers/mongodb.js";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "./helpers/jwt.js";
dotenv.config();

//App Config
const app = express();
const port = 7000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//OK for now... eventually, move this array onto redis
let users = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId == userId);
};

//socket-io
io.use((socket, next) => {
  if (socket.handshake.auth && socket.handshake.auth.accessToken) {
    jwt.verify(
      socket.handshake.auth.accessToken,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return next(createError.Unauthorized());
        socket.decoded = decoded;
        next();
      }
    );
  } else {
    next(createError.Unauthorized());
  }
}).on("connection", (socket) => {
  io.emit("welcome", "This is the socket. Hi!");

  //take the userId and socketId from client
  socket.on("sendUser", (userId) => {
    console.log(userId, "connected!");

    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //sending and getting message
  socket.on(
    "sendMessage",
    ({ conversationId, sender, receiver, text, createdAt }) => {
      //if user is undefined, the client to recieve the message is offline
      const user = getUser(receiver);
      if (user) {
        io.to(user.socketId).emit("getMessage", {
          sender,
          text,
          createdAt,
        });
      } else {
        console.log(receiver, "is currently offline");
      }

      //message sent to database asynchronously
      try {
        const savedMessage = new Message({
          conversationId: conversationId,
          sender: sender,
          text: text,
          createdAt: createdAt,
        }).save();
      } catch (err) {
        console.error(err);
      }
    }
  );

  //sending and getting friend requests
  socket.on(
    "sendFriendRequest",
    async ({ senderId, senderName, receiverEmail }) => {
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
    }
  );

  socket.on(
    "respondToRequest",
    async ({ requestId, requesterId, recipientId, response }) => {
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
    }
  );

  //client attempting to create 1 to 1 chat
  socket.on("newPrivateChat", async ({ senderId, receiverId }) => {
    const existingConversation = await Conversation.findOne({
      members: { $size: 2, $all: [senderId, receiverId] },
    });
    const user = getUser(receiverId);
    if (!existingConversation) {
      const _id = mongoose.Types.ObjectId();
      const newConversation = new Conversation({
        _id: _id,
        members: [senderId, receiverId],
        messages: [],
        hidden: false,
      });
      //checks if receiver is connected to socket

      if (user) {
        console.log("Sent to other receiver");
        io.to(user.socketId).emit("getNewChat", newConversation);
      }
      io.to(getUser(senderId).socketId).emit("getNewChat", newConversation);
      newConversation.save();
      io.to(getUser(senderId).socketId).emit("openMessage", { _id });
    } else {
      //conversation between these two users already exists, simply open
      const _id = existingConversation._id;
      io.to(getUser(senderId).socketId).emit("openMessage", { _id });
    }
  });

  //when client disconnects from the socket
  socket.on("disconnect", () => {
    console.log(socket.id, "disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

//Routes Import
import conversationsRoute from "./routes/conversations.js";
import messageRoute from "./routes/messages.js";
import requestRoute from "./routes/friendsRequests.js";
import userRoute from "./routes/user.js";

//Middlewares
app.use(express.json());
app.use(cors());
app.use(verifyAccessToken);

//API Endpoints
app.get("/", async (req, res) => {
  res.status(200).send("Data Server Up");
});

app.use("/api/conversations", conversationsRoute);
app.use("/api/messages", messageRoute);
app.use("/api/requests", requestRoute);
app.use("/api/user", userRoute);

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
