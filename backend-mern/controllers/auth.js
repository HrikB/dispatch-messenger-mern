import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createAccessJWT, createRefreshJWT } from "../utils/auth.js";
import redisClient from "../redis.js";

export let signup = (req, res) => {
  let { first_name, last_name, email, password, password_confirm } = req.body;

  //input validation
  let errors = [];
  if (!first_name) {
    errors.push({ first_name: "required" });
  }
  if (!last_name) {
    errors.push({ last_name: "required" });
  }
  if (!email) {
    errors.push({ email: "required" });
  }
  if (!password) {
    errors.push({ password: "required" });
  }
  if (!password_confirm) {
    errors.push({
      password_confirmation: "required",
    });
  }
  if (password != password_confirm) {
    errors.push({ password: "mismatch" });
  }
  if (errors.length > 0) {
    return res.status(422).json({ errors: errors });
  }

  User.findOne({ email: email })
    .then(async (user) => {
      if (user) {
        return res
          .status(422)
          .json({ errors: [{ email: "email already exists" }] });
      } else {
        const user = new User({
          first_name: first_name,
          last_name: last_name,
          email: email,
          password: password,
        });

        const hash = await bcrypt.hash(password, 10);
        user.password = hash;
        user
          .save()
          .then((response) => {
            res.status(200).json({
              success: true,
              result: response,
            });
          })
          .catch((err) => {
            res.status(500).json({ errors: [{ error: err }] });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({ errors: [{ error: err }] });
    });
};

export let signin = (req, res) => {
  let { email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          errors: [{ error: "User/email not found" }],
        });
      } else {
        bcrypt
          .compare(password, user.password)
          .then((isMatch) => {
            if (!isMatch) {
              return res
                .status(400)
                .json({ errors: [{ error: "Password is incorrect" }] });
            }

            const accessToken = createAccessJWT(user.email, user._id);
            const refreshToken = createRefreshJWT(user.email, user._id);
            redisClient.set(
              user._id.toString(),
              JSON.stringify({ token: refreshToken })
            );

            jwt.verify(
              accessToken,
              process.env.ACCESS_TOKEN_SECRET,
              (err, user) => {
                if (err) {
                  res.status(500).json({ errors: err });
                }
                if (user) {
                  return res.status(200).json({
                    success: true,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    message: user,
                  });
                }
              }
            );
          })
          .catch((err) => {
            res.status(500).json({ errors: err });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({ errors: err });
    });
};

export let token = (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    redisClient.get(user.userId, (err, data) => {
      if (err) throw err;
      if (data == null)
        return res.status(401).json({
          status: false,
          message: "Invalid request. Token is not in store.",
        });
      if (JSON.parse(data).token != refreshToken) {
        return res.status(401).json({
          status: false,
          message: "Invalid request. Token is not in store.",
        });
      }
      const accessToken = createAccessJWT(user.email, user._id);
      if (user) {
        return res.status(200).json({
          success: true,
          accessToken: accessToken,
          message: user,
        });
      }
    });
  } catch (err) {
    return res.status(401).json({
      status: true,
      message: "Your session is not valid",
      data: error,
    });
  }

  /*
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = createAccessJWT(user.email, user._id);
    if (user) {
      return res.status(200).json({
        success: true,
        accessToken: accessToken,
        refreshToken: refreshToken,
        message: user,
      });
    }
  });*/
};

export let logout = async (req, res) => {
  let { user_id, token } = req.body;
  await redisClient.del(user_id.toString());

  //blacklist current access token
  await redisClient.set("BL_" + user_id, token);
  //refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
};

export let getData = async (req, res) => {
  let userId = req.params.id;
  try {
    const userData = await User.findOne({ _id: userId });
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
};
