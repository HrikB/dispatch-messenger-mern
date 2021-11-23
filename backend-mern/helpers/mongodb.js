import mongoose from "mongoose";
import dotenv from "dotenv";
import Grid from "gridfs-stream";
dotenv.config();

//DB Config

export const promise = mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
});

export let gfsImage;
export let gfsAudio;
mongoose.connection.once("open", () => {
  gfsImage = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "profile_pictures",
  });
  gfsAudio = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "voice_messages",
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
