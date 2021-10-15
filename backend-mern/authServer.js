import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import createError from "http-errors";
dotenv.config();
import "./helpers/mongodb.js";

//Import Routes
import authRoute from "./routes/auth.js";

//App Config
const app = express();
const port = process.env.PORT || 8000;

//Middlewares
app.use(express.json());
app.use(cors());

//API Endpoints
app.use("/auth", authRoute);
app.get("/", (req, res) => {
  res.status(200).send("Auth Server Up");
});

//Error handling middleware
app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

//Listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));
