import User from "../models/User.js";

export let getDataById = async (req, res) => {
  let userId = req.params.id;
  console.log(userId);
  try {
    const userData = await User.findOne({ _id: userId });
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
};

export let getDataByEmail = async (req, res) => {
  let userEmail = req.params.email;
  try {
    const userData = await User.findOne({ email: userEmail });
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
};
