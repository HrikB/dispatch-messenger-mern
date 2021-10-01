import jwt from "jsonwebtoken";

export let createAccessJWT = (email, userId) => {
  const payload = {
    email,
    userId,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5s",
  });
};

export let createRefreshJWT = (email, userId) => {
  const payload = {
    email,
    userId,
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
};
