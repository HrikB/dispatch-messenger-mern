import Message from "../models/Message.js";

//api routes
export let getMessage = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    console.log(err.message);
    next(createError.InternalServerError());
  }
};

//socket functions
export let sendMessage = ({ conversationId, sender, receiver, text }) => {
  //if user is undefined, the client to recieve the message is offline
  const user = getUser(receiver);

  if (user) {
    io.to(user.socketId).emit("getMessage", {
      sender,
      text,
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
    }).save();
  } catch (err) {
    console.error(err);
  }
};
