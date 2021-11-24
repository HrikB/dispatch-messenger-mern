import JWT from "jsonwebtoken";
import createError from "http-errors";
import redisClient from "./redis.js";
import dotenv from "dotenv";
dotenv.config();

export const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: userId, //user info
      iss: process.env.AUTH_SERVER_LINK, //issuer of the token
      aud: process.env.CLIENT_LINK, //whom the token is issued for
    };
    const options = {
      expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY}`,
    };
    JWT.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      options,
      (err, token) => {
        if (err) {
          console.log("??", err);
          reject(createError.InternalServerError());
        }
        resolve(token);
      }
    );
  });
};

export const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: userId, //user info
      iss: process.env.AUTH_SERVER_LINK, //issuer of the token
      aud: process.env.CLIENT_LINK, //whom the token is issued for
    };
    const options = {
      expiresIn: `${process.env.REFRESH_TOKEN_EXPIRY}`,
    };
    JWT.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      options,
      (err, token) => {
        if (err) {
          console.log("?", err.message);
          reject(createError.InternalServerError());
        }
        redisClient.SET(
          userId.toString(),
          token,
          "EX",
          365 * 24 * 3600,
          (err, reply) => {
            if (err) {
              console.log("/", err);
              reject(createError.InternalServerError());
              return;
            }
            resolve(token);
          }
        );
      }
    );
  });
};

export const verifyAccessToken = async (req, res, next) => {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());
  const authHeader = req.headers["authorization"].split(" ");
  const accessToken = authHeader[1];
  try {
    const payload = await JWT.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.payload = payload;
    next();
  } catch (err) {
    console.log("jwt-err", err.message);
    if (err.name === "JsonWebTokenError") {
      return next(createError.Unauthorized());
    }

    return next(createError.Unauthorized(err.message));
  }
};

export const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) {
          console.log("err1", err.message);
          return reject(createError.Unauthorized());
        }
        const userId = payload.sub;
        redisClient.GET(userId, (err, result) => {
          if (err) {
            console.log("err2", err.message);
            reject(createError.InternalServerError());
            return;
          }
          if (refreshToken === result) return resolve(userId);
          reject(createError.Unauthorized("err3"));
        });
      }
    );
  });
};
