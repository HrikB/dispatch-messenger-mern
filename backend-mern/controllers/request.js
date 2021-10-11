import FriendRequest from "../models/FriendRequest.js";

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
  const newRequest = new FriendRequest(req.body);
  //need to send error msg if friendRequest in either
  //direction has already been sent
  try {
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
    console.log(existingRequest);
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
    res.status(500).json(err);
  }
};

export const requestResponse = async (req, res) => {
  const response = req.body;
};
