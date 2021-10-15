import redis from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = redis.createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOST
);

console.log(
  process.env.REDIS_PASSWORD,
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

export default redisClient;
