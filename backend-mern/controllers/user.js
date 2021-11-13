import User from "../models/User.js";
import createError from "http-errors";
import Joi from "@hapi/joi";

export let getDataById = async (req, res) => {
  let userId = req.params.id;
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

export let updateProfilePic = async (req, res) => {
  const { userId, profPic } = req.body;
  try {
    const update = await User.updateOne(
      { _id: userId },
      { $set: { prof_pic: profPic } }
    );
    res.status(200).json(update);
  } catch (err) {
    console.log("prof_pic", err.message);
    next(err);
  }
};

export let updateFirstName = async (req, res, next) => {
  const { userId, firstName } = req.body;
  if (firstName === "")
    throw createError.BadRequest("First name cannot be empty");
  try {
    const update = await User.updateOne(
      { _id: userId },
      { $set: { first_name: firstName } }
    );
    res.status(200).json(update);
  } catch (err) {
    console.log("first_name", err.message);
    next(err);
  }
};

export let updateLastName = async (req, res) => {
  const { userId, lastName } = req.body;

  try {
    if (lastName === "")
      throw createError.BadRequest("Last name cannot be empty");
    const update = await User.updateOne(
      { _id: userId },
      { $set: { last_name: lastName } }
    );
    res.status(200).json(update);
  } catch (err) {
    console.log("last_name", err.message);
    next(err);
  }
};

export let updateEmail = async (req, res, next) => {
  const { userId, email } = req.body;
  try {
    //validates email
    const validation = await Joi.object({
      email: Joi.string().email().lowercase().required(),
    }).validateAsync({ email });

    //checks if email is already in use
    const emailUsed = await User.findOne({ email: validation.email });
    if (emailUsed)
      throw createError.Conflict(
        `The email "${validation.email}" is already in use.`
      );

    const update = await User.updateOne({ _id: userId }, { $set: { email } });
    res.status(200).json(update);
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    console.log("email", err.message);
    next(err);
  }
};

export let updatePassword = async (req, res) => {
  const { userId, password } = req.body;
};
