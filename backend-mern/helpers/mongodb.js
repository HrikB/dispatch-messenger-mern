import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

//DB Config

export const promise = mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
});

export let gfs;
mongoose.connection.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "profile_pictures",
  });
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log(err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoonse disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
