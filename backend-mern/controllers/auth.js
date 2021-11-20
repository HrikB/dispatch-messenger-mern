import User from "../models/User.js";
import redisClient from "../helpers/redis.js";
import createError from "http-errors";
import {
  registerSchema,
  loginSchema,
} from "../helpers/userValidationSchema.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../helpers/jwt.js";

export let signup = async (req, res, next) => {
  try {
    const validation = await registerSchema.validateAsync(req.body);

    //checks if email is already in use
    const userExists = await User.findOne({ email: validation.email });
    if (userExists)
      throw createError.Conflict(
        `The email "${validation.email}" is already in use.`
      );

    //creates new user object
    const user = new User(Object.assign({}, validation, { online: true }));

    const savedUser = await user.save();
    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);
    res.status(200).send({ user, accessToken, refreshToken });
  } catch (err) {
    if (err.isJoi === true) {
      err.message = err.details;
      err.status = 422;
    }
    next(err);
  }
};

export let signin = async (req, res, next) => {
  try {
    //input validation
    const validation = await loginSchema.validateAsync(req.body);
    const user = await User.findOne({ email: validation.email });
    if (!user) throw createError.NotFound("User not registered");

    const isValidPassword = await user.validatePassword(validation.password);
    if (!isValidPassword)
      throw createError.BadRequest("Username/Password not valid");

    //update online status
    await User.updateOne({ _id: user._id }, { $set: { online: true } });
    const accessToken = await signAccessToken(user._id);
    const refreshToken = await signRefreshToken(user._id);
    res
      .cookie("accessToken", accessToken, {
        sameSite: "lax",
        httpOnly: true,
      })
      .cookie("authSession", true)
      .cookie("refreshToken", refreshToken, {
        sameSite: "lax",
        httpOnly: true,
      })
      .cookie("refreshTokenID", true)
      .send({ user, accessToken, refreshToken });
  } catch (err) {
    if (err.isJoi) {
      return next(createError.BadRequest(err.details));
    }

    next(createError.BadRequest("Email or password is incorrect"));
  }
};

export let token = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);

    res.send({ accessToken, refreshToken: refToken });
  } catch (err) {
    next(err);
  }
};

export let logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    await User.updateOne({ _id: userId }, { $set: { online: false } });

    redisClient.DEL(userId, (err, reply) => {
      if (err) {
        throw createError.InternalServerError();
      }
      res.sendStatus(204);
    });
  } catch (err) {
    next(err);
  }

  /*let { user_id, token } = req.body;
  await redisClient.del(user_id.toString());

  //blacklist current access token
  await redisClient.set("BL_" + user_id, token);
  //refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);*/
};
