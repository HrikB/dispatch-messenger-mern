import User from "../models/User.js";
import createError from "http-errors";
import Joi from "@hapi/joi";
import { getUser } from "../helpers/redis.js";
import { deleteImage } from "./images.js";

export let getOnlineStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let online = false;
    const userOnline = await getUser(id);

    if (userOnline) online = true;

    res.status(200).send({ isOnline: online });
  } catch (err) {
    next(err);
  }
};

export let getDataById = async (req, res, next) => {
  let userId = req.params.id;
  try {
    const userData = await User.findOne(
      { _id: userId },
      { password: 0, createdAt: 0, updatedAt: 0, friendsList: 0 }
    );
    res.status(200).json(userData);
  } catch (err) {
    next(err);
  }
};

export let getDataByEmail = async (req, res, next) => {
  let userEmail = req.params.email;
  try {
    const userData = await User.findOne({ email: userEmail });
    res.status(200).json(userData);
  } catch (err) {
    next(err);
  }
};

export let updateProfilePic = async (req, res, next) => {
  const { userId, profPic } = req.body;
  try {
    const userDoc = await User.findOne({ _id: userId });
    if (userDoc.prof_pic && userDoc.prof_pic.length <= 24) {
      await deleteImage(userDoc.prof_pic);
    }

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

  try {
    const validation = await Joi.object({
      firstName: Joi.string()
        .required()
        .regex(/^[a-zA-Z]+$/)
        .messages({
          "string.empty": "This field cannot be empty",
          "string.pattern.base":
            "This field cannot have spaces, numbers, or symbols",
        }),
    }).validateAsync({ firstName });

    const firstNameFormatted =
      firstName[0]?.toUpperCase() + firstName.substring(1);

    const update = await User.updateOne(
      { _id: userId },
      { $set: { first_name: firstNameFormatted } }
    );
    res.status(200).json(update);
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    console.log("first_name", err.message);
    next(err);
  }
};

export let updateLastName = async (req, res, next) => {
  const { userId, lastName } = req.body;

  try {
    const validation = await Joi.object({
      lastName: Joi.string()
        .required()
        .regex(/^[a-zA-Z]+$/)
        .messages({
          "string.empty": "This field cannot be empty",
          "string.pattern.base":
            "This field cannot have spaces, numbers, or symbols",
        }),
    }).validateAsync({ lastName });

    const lastNameFormatted =
      lastName[0]?.toUpperCase() + lastName.substring(1);

    const update = await User.updateOne(
      { _id: userId },
      { $set: { last_name: lastNameFormatted } }
    );
    res.status(200).json(update);
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    console.log("last_name", err.message);
    next(err);
  }
};

export let updateEmail = async (req, res, next) => {
  const { userId, email } = req.body;
  try {
    //validates email
    const validation = await Joi.object({
      email: Joi.string().email().lowercase().required().messages({
        "string.empty": "This field cannot be empty",
        "string.email": "Must be a valid email",
      }),
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
    console.log("email", err);
    next(err);
  }
};

export let updatePassword = async (req, res) => {
  const { userId, password } = req.body;
};
