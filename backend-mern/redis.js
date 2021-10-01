import redis from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST
);

console.log(
  process.env.PASSWORD,
  process.env.REDIS_PORT,
  process.env.REDIS_HOST
);
redisClient.auth(process.env.PASSWORD, (err) => {
  if (err) throw err;
});

redisClient.on("connect", () => {
  console.log("redis client connected");
});

export default redisClient;
