import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import createError from "http-errors";
import cookieParser from "cookie-parser";
dotenv.config();
import "./helpers/mongodb.js";

//Import Routes
import authRoute from "./routes/auth.js";

//App Config
const app = express();
const port = process.env.PORT || 8000;

//Middlewares
app.use(express.json());
app.use(
  cors({
    origin: `http://${process.env.SERVER_HOST}:3000`,
    credentials: true,
  })
);
app.use(cookieParser());

//API Endpoints
app.get("/", (req, res) => {
  res.status(200).send("Auth Server Up");
});

//Route imports
app.use("/auth", authRoute);

//Error handling middleware
app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  console.log("fromReq", req.url, err.message, err.status);
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
