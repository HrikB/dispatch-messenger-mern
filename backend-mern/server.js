import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

//Import Routes
import authRoute from "./routes/auth.js";
import User from "./models/User.js";

//App Config
const app = express();
const port = process.env.PORT || 8000;

//Middlewares
app.use(express.json());
app.use(cors());
app.use("/api", authRoute);

//DB Config
mongoose.connect(process.env.DATABASE).then(() => {
  console.log("DB Connected");
});

//API Endpoints
app.get("/", (req, res) => res.status(200).send("Hello World"));

//Listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));
