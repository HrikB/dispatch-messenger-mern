import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

const authenticateToken = (req, res, next) => {
  next();
};

//App Config
const app = express();
const port = 7000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//socket-io
io.on("connection", (socket) => {
  console.log(socket.handshake.auth.accessToken, "is the access token");
});

//Routes Import
import conversationsRoute from "./routes/conversations.js";
import messageRoute from "./routes/messages.js";

//Middlewares
app.use(express.json());
app.use(cors());
app.use("/api/conversations", conversationsRoute);
app.use("/api/messages", messageRoute);

//DB Config
mongoose.connect(process.env.DATABASE).then(() => {
  console.log("DB Connected");
});

//API Endpoints
app.get("/", (req, res) => res.status(200).send("Data Server Up"));
app.get("/friends", authenticateToken, (req, res) => {});

//Listener
httpServer.listen(port, () => console.log(`listening on localhost: ${port}`));
