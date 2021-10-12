import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
export const getRequest = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      $or: [
        { requesterId: req.params.userId },
        { recipientId: req.params.userId },
      ],
    });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const sendRequest = async (req, res) => {
  const { userId, userName, receiverEmail } = req.body;
  //need to send error msg if friendRequest in either
  //direction has already been sent
  console.log("email", userId);
  try {
    const receiverData = await User.findOne({ email: receiverEmail });
    console.log(receiverData);
    const newRequest = new FriendRequest({
      requesterId: userId,
      recipientId: receiverData._id,
      requesterName: userName,
      recipientName: receiverData.first_name + " " + receiverData.last_name,
    });
    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          requesterId: newRequest.requesterId,
          recipientId: newRequest.recipientId,
        },
        {
          requesterId: newRequest.recipientId,
          recipientId: newRequest.requesterId,
        },
      ],
    });
    if (!existingRequest) {
      const sentRequest = await newRequest.save();
      res.status(200).json(sentRequest);
    } else {
      res.status(404).json({
        errors: [
          {
            error: "There is already a pending friend request with this user",
          },
        ],
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
