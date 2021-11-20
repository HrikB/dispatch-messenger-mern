import redis from "redis";
import dotenv from "dotenv";
import util from "util";
dotenv.config();

const redisClient = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST
);

redisClient.auth(process.env.REDIS_PASSWORD, (err) => {
  if (err) throw err;
});

redisClient.on("connect", () => {
  console.log("redis client connected");
});

redisClient.on("ready", () => {
  console.log("redis client connected and ready");
  redisClient.flushall();
});

redisClient.on("error", (err) => {
  console.log(err.message);
});

redisClient.on("end", () => {
  console.log("redis client disconnected");
});

process.on("SIGINT", () => {
  redisClient.quit();
});

//OK for now... eventually, move this array onto redis
export const addUser = async (userId, socketId) => {
  redisClient.hset = util.promisify(redisClient.hset);
  await redisClient.hset("socketConns", userId, socketId);
};

export const removeUser = async (userId) => {
  redisClient.hdel = util.promisify(redisClient.hdel);
  await redisClient.hdel("socketConns", userId);
};

export const getUser = async (userId) => {
  redisClient.hget = util.promisify(redisClient.hget);
  const socketId = await redisClient.hget("socketConns", userId);
  return socketId;
};

export default redisClient;
